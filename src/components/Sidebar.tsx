import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  TrendingUp, 
  LineChart, 
  AlertTriangle, 
  Lightbulb, 
  FileText, 
  Settings, 
  Boxes,
  X,
  Store,
  Sparkles
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export type NavPage = 
  | 'Dashboard' 
  | 'Inventory' 
  | 'Sales Analytics' 
  | 'Demand Forecast' 
  | 'Stock Alerts' 
  | 'Recommendations' 
  | 'Reports' 
  | 'Settings';

interface SidebarProps {
  activePage: NavPage;
  setActivePage: (page: NavPage) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  isOpen,
  onClose
}) => {
  const { settings, stockAlerts } = useInventory();
  const criticalCount = stockAlerts.filter(a => a.severity === 'high').length;

  const navItems: { label: NavPage; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Inventory', icon: Package },
    { label: 'Sales Analytics', icon: TrendingUp },
    { label: 'Demand Forecast', icon: LineChart },
    { label: 'Stock Alerts', icon: AlertTriangle, badge: criticalCount > 0 ? criticalCount : undefined },
    { label: 'Recommendations', icon: Lightbulb },
    { label: 'Reports', icon: FileText },
    { label: 'Settings', icon: Settings }
  ];

  const handleNavClick = (page: NavPage) => {
    setActivePage(page);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div className="sidebar-overlay lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0F172A] text-slate-300 flex flex-col justify-between
        transition-transform duration-300 ease-in-out border-r border-slate-800
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight font-sans">InventoryIQ</span>
                <span className="text-[10px] block text-indigo-400 font-semibold uppercase tracking-wider">Intelligence AI</span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button 
              onClick={onClose} 
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
              Main Menu
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.label;

              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.label)}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${isActive ? 'bg-white text-indigo-700' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Footer Section */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold text-sm">
              <Store className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{settings.businessName}</p>
              <p className="text-xs text-slate-400 truncate">Store Manager</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
