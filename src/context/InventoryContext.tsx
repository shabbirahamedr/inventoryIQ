import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, SalesRecord, ProductMetrics, StockAlert, InventoryRecommendation, AppSettings } from '../types/inventory';
import { generateDemoData } from '../services/demoDataGenerator';
import { calculateProductMetrics, generateStockAlerts, generateRecommendations } from '../services/inventoryEngine';

interface InventoryContextType {
  products: Product[];
  sales: SalesRecord[];
  settings: AppSettings;
  productMetrics: ProductMetrics[];
  stockAlerts: StockAlert[];
  recommendations: InventoryRecommendation[];
  dateFilter: 'Today' | '7 Days' | '30 Days' | '90 Days' | 'Custom';
  setDateFilter: (filter: 'Today' | '7 Days' | '30 Days' | '90 Days' | 'Custom') => void;
  selectedProductDetail: ProductMetrics | null;
  setSelectedProductDetail: (product: ProductMetrics | null) => void;
  isImportModalOpen: boolean;
  setIsImportModalOpen: (open: boolean) => void;
  isAddProductModalOpen: boolean;
  setIsAddProductModalOpen: (open: boolean) => void;
  addProduct: (product: Omit<Product, 'id' | 'status' | 'lastUpdated'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  importData: (newProducts: Product[], newSales: SalesRecord[]) => void;
  resetToDemoData: () => void;
  clearAllData: () => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const defaultSettings: AppSettings = {
  businessName: 'SuperRetail Stores',
  currencySymbol: '₹',
  currencyCode: 'INR',
  defaultReorderThreshold: 25,
  safetyStockPercent: 20,
  forecastPeriodDays: 14,
  notificationsEnabled: true,
  isDemoData: true
};

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const STORAGE_KEY_PRODUCTS = 'inventoryiq_products_v1';
const STORAGE_KEY_SALES = 'inventoryiq_sales_v1';
const STORAGE_KEY_SETTINGS = 'inventoryiq_settings_v1';

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    const demo = generateDemoData();
    return demo.products;
  });

  const [sales, setSales] = useState<SalesRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SALES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    const demo = generateDemoData();
    return demo.sales;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return defaultSettings;
  });

  const [dateFilter, setDateFilter] = useState<'Today' | '7 Days' | '30 Days' | '90 Days' | 'Custom'>('30 Days');
  const [selectedProductDetail, setSelectedProductDetail] = useState<ProductMetrics | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SALES, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Determine window days for metrics
  const daysWindow = useMemo(() => {
    switch (dateFilter) {
      case 'Today': return 1;
      case '7 Days': return 7;
      case '30 Days': return 30;
      case '90 Days': return 90;
      default: return 30;
    }
  }, [dateFilter]);

  // Compute Product Metrics
  const productMetrics = useMemo(() => {
    return products.map(p => calculateProductMetrics(p, sales, daysWindow));
  }, [products, sales, daysWindow]);

  // Compute Stock Alerts
  const stockAlerts = useMemo(() => {
    return generateStockAlerts(productMetrics);
  }, [productMetrics]);

  // Compute Recommendations
  const recommendations = useMemo(() => {
    return generateRecommendations(productMetrics, settings.forecastPeriodDays);
  }, [productMetrics, settings.forecastPeriodDays]);

  const addProduct = (productData: Omit<Product, 'id' | 'status' | 'lastUpdated'>) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newId = `PROD-${Date.now().toString().slice(-4)}`;
    
    // Initial status check
    let status: Product['status'] = 'Healthy';
    if (productData.currentStock <= productData.reorderLevel) {
      status = 'Reorder Soon';
    }

    const newProd: Product = {
      ...productData,
      id: newId,
      status,
      lastUpdated: todayStr
    };

    setProducts(prev => [newProd, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setSales(prev => prev.filter(s => s.productId !== id));
  };

  const importData = (newProducts: Product[], newSales: SalesRecord[]) => {
    setProducts(prev => {
      const map = new Map<string, Product>();
      // Preserve existing if not overwritten
      prev.forEach(p => map.set(p.name.toLowerCase(), p));
      newProducts.forEach(p => map.set(p.name.toLowerCase(), p));
      return Array.from(map.values());
    });

    if (newSales.length > 0) {
      setSales(prev => [...newSales, ...prev]);
    }

    setSettings(prev => ({ ...prev, isDemoData: false }));
  };

  const resetToDemoData = () => {
    const demo = generateDemoData();
    setProducts(demo.products);
    setSales(demo.sales);
    setSettings(prev => ({ ...prev, isDemoData: true }));
  };

  const clearAllData = () => {
    setProducts([]);
    setSales([]);
    setSettings(prev => ({ ...prev, isDemoData: false }));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <InventoryContext.Provider value={{
      products,
      sales,
      settings,
      productMetrics,
      stockAlerts,
      recommendations,
      dateFilter,
      setDateFilter,
      selectedProductDetail,
      setSelectedProductDetail,
      isImportModalOpen,
      setIsImportModalOpen,
      isAddProductModalOpen,
      setIsAddProductModalOpen,
      addProduct,
      updateProduct,
      deleteProduct,
      importData,
      resetToDemoData,
      clearAllData,
      updateSettings
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
