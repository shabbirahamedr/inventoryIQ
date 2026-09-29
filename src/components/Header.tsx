import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Upload, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown,
  Sparkles,
  Database,
  Store
} from 'lucide-react';
import { NavPage } from './Sidebar';
import { useInventory } from '../context/InventoryContext';

interface HeaderProps {
  activePage: NavPage;
  onOpenMobileSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onOpenMobileSidebar,
  searchQuery,
  setSearchQuery
}) => {
  const { stockAlerts, setIsImportModalOpen, setIsAddProductModalOpen, settings, resetToDemoData } = useInventory();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pageSubtitles: Record<NavPage, string> = {
    'Dashboard': "Here's your inventory overview and today's important insights.",
    'Inventory': 'Monitor your current stock, reorder points, and inventory health.',
    'Sales Analytics': 'Analyze historical sales velocity, revenue patterns, and product trends.',
    'Demand Forecast': 'Estimate future product demand using historical sales patterns.',
    'Stock Alerts': 'Real-time inventory alerts for critical stockouts and overstock risks.',
    'Recommendations': 'Actionable purchase and reordering recommendations powered by sales velocity.',
    'Reports': 'Generate, view, and download automated inventory & sales intelligence reports.',
    'Settings': 'Configure business preferences, inventory thresholds, and forecast options.'
  };

  return (
    <header className="sticky top-0 z-30 h-16 glass-header px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Open Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{activePage}</h1>
            {settings.isDemoData && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Database className="w-3 h-3" /> Demo Data Active
              </span>
            )}
          </div>
          <p className="hidden sm:block text-xs text-slate-500 truncate max-w-md">
            {pageSubtitles[activePage]}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar */}
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products, SKUs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100/80 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all"
          />
        </div>

        {/* Quick Import CTA */}
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="btn-primary py-1.5 px-3 text-xs shadow-sm"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Import Data</span>
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {stockAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {/* Notification Popover Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="font-semibold text-xs text-slate-800">Inventory Alerts ({stockAlerts.length})</span>
                <span className="text-[10px] text-slate-500">Auto-calculated</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {stockAlerts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 flex flex-col items-center gap-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <span>All stock levels are optimal! No urgent alerts.</span>
                  </div>
                ) : (
                  stockAlerts.slice(0, 5).map(alert => (
                    <div key={alert.id} className="p-3 hover:bg-slate-50 transition-colors flex gap-2.5">
                      <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                        alert.severity === 'high' ? 'text-rose-500' : 'text-amber-500'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-900 truncate">{alert.productName}</p>
                          <span className="text-[10px] font-bold text-slate-500">{alert.currentStock} left</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{alert.reason}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 text-xs">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900">{settings.businessName}</p>
                <p className="text-[11px] text-slate-500">Retail & Inventory Admin</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { resetToDemoData(); setShowProfileMenu(false); }}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                >
                  <Database className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Reload Demo Dataset</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
