export type StockStatus = 'Healthy' | 'Monitor' | 'Reorder Soon' | 'Critical' | 'Overstocked';

export type RiskLevel = 'High' | 'Medium' | 'Low' | 'None';

export type DemandTrend = 'Increasing' | 'Stable' | 'Decreasing';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  supplier: string;
  unitPrice: number;
  currentStock: number;
  reorderLevel: number;
  leadTime: number; // in days
  minOrderQty: number;
  status: StockStatus;
  lastUpdated: string;
}

export interface SalesRecord {
  id: string;
  productId: string;
  productName: string;
  category: string;
  quantitySold: number;
  unitPrice: number;
  revenue: number;
  date: string; // YYYY-MM-DD
  stockRemaining?: number;
}

export interface ProductMetrics {
  productId: string;
  productName: string;
  category: string;
  sku: string;
  unitPrice: number;
  currentStock: number;
  reorderLevel: number;
  leadTime: number;
  minOrderQty: number;
  inventoryValue: number;
  totalUnitsSold: number;
  totalRevenue: number;
  avgDailySales: number;
  avgWeeklySales: number;
  daysOfInventoryRemaining: number;
  safetyStock: number;
  reorderPoint: number;
  stockoutRisk: RiskLevel;
  overstockRisk: RiskLevel;
  demandTrend: DemandTrend;
  salesVelocity: 'Fast' | 'Moderate' | 'Slow';
  status: StockStatus;
}

export interface DailyForecastPoint {
  date: string;
  historicalQuantity: number | null;
  predictedQuantity: number | null;
}

export interface ForecastResult {
  productId: string;
  productName: string;
  category: string;
  currentStock: number;
  horizonDays: number;
  avgDailyDemand: number;
  predictedTotalDemand: number;
  demandTrend: DemandTrend;
  confidenceLevel: number; // e.g. 92%
  stockoutDays: number | null;
  chartData: DailyForecastPoint[];
}

export type AlertType = 'critical' | 'reorder_soon' | 'overstocked' | 'slow_moving';

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  category: string;
  type: AlertType;
  severity: 'high' | 'medium' | 'low';
  currentStock: number;
  avgDailySales: number;
  estimatedStockoutDays: number | null;
  actionText: string;
  reason: string;
}

export type RecommendationType = 'REORDER' | 'REDUCE_PURCHASE' | 'MONITOR';

export interface InventoryRecommendation {
  id: string;
  productId: string;
  productName: string;
  category: string;
  type: RecommendationType;
  currentStock: number;
  predictedDemand: number;
  recommendedQty: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
}

export interface AppSettings {
  businessName: string;
  currencySymbol: string; // ₹, $, €, £
  currencyCode: string; // INR, USD, EUR, GBP
  defaultReorderThreshold: number;
  safetyStockPercent: number;
  forecastPeriodDays: number;
  notificationsEnabled: boolean;
  isDemoData: boolean;
}

export interface ImportPreviewRow {
  [key: string]: any;
}

export interface ImportValidationResult {
  fileName: string;
  fileSize: number;
  totalRows: number;
  detectedColumns: string[];
  requiredColumnsFound: boolean;
  missingColumns: string[];
  missingValuesCount: number;
  invalidValuesCount: number;
  previewData: ImportPreviewRow[];
  parsedProducts: Product[];
  parsedSales: SalesRecord[];
}
