import React, { useState } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { AiAssistantProvider } from './context/AiAssistantContext';
import { Sidebar, NavPage } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { SalesAnalyticsPage } from './pages/SalesAnalyticsPage';
import { DemandForecastPage } from './pages/DemandForecastPage';
import { StockAlertsPage } from './pages/StockAlertsPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AddProductModal } from './components/AddProductModal';
import { ImportDataModal } from './components/ImportDataModal';
import { ProductDetailModal } from './components/ProductDetailModal';

const AppContent: React.FC = () => {
  const [activePage, setActivePage] = useState<NavPage>('Dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    isAddProductModalOpen,
    setIsAddProductModalOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    selectedProductDetail,
    setSelectedProductDetail
  } = useInventory();

  const renderActivePage = () => {
    switch (activePage) {
      case 'Dashboard':
        return <DashboardPage />;
      case 'Inventory':
        return <InventoryPage />;
      case 'Sales Analytics':
        return <SalesAnalyticsPage />;
      case 'Demand Forecast':
        return <DemandForecastPage />;
      case 'Stock Alerts':
        return <StockAlertsPage />;
      case 'Recommendations':
        return <RecommendationsPage />;
      case 'Reports':
        return <ReportsPage />;
      case 'Settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Header */}
        <Header
          activePage={activePage}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Page Body */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* Interactive Global Modals */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
      />

      <ImportDataModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      <ProductDetailModal
        product={selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <InventoryProvider>
      <AiAssistantProvider>
        <AppContent />
      </AiAssistantProvider>
    </InventoryProvider>
  );
};

export default App;
