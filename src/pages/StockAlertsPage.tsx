import React, { useState } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  PackageCheck, 
  Clock, 
  ArrowRight, 
  ShieldAlert, 
  Boxes,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { AlertType, StockAlert } from '../types/inventory';

export const StockAlertsPage: React.FC = () => {
  const { stockAlerts, setSelectedProductDetail, productMetrics } = useInventory();
  const [activeTab, setActiveTab] = useState<AlertType | 'ALL'>('ALL');

  const criticalAlerts = stockAlerts.filter(a => a.type === 'critical');
  const reorderAlerts = stockAlerts.filter(a => a.type === 'reorder_soon');
  const overstockedAlerts = stockAlerts.filter(a => a.type === 'overstocked');
  const slowAlerts = stockAlerts.filter(a => a.type === 'slow_moving');

  const displayedAlerts = activeTab === 'ALL' 
    ? stockAlerts 
    : stockAlerts.filter(a => a.type === activeTab);

  const getAlertCardStyle = (type: AlertType) => {
    switch (type) {
      case 'critical':
        return 'bg-rose-50/70 border-rose-200 text-rose-900';
      case 'reorder_soon':
        return 'bg-amber-50/70 border-amber-200 text-amber-900';
      case 'overstocked':
        return 'bg-slate-50 border-slate-200 text-slate-900';
      case 'slow_moving':
        return 'bg-indigo-50/50 border-indigo-200 text-indigo-900';
    }
  };

  const getAlertBadge = (type: AlertType) => {
    switch (type) {
      case 'critical':
        return 'bg-rose-600 text-white';
      case 'reorder_soon':
        return 'bg-amber-600 text-white';
      case 'overstocked':
        return 'bg-slate-700 text-white';
      case 'slow_moving':
        return 'bg-indigo-600 text-white';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" /> Stock Alert Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">Real-time automated alerts for critical stockouts, reorder points, and overstock risks</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ALL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Alerts ({stockAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('critical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'critical' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Critical ({criticalAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('reorder_soon')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'reorder_soon' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reorder Soon ({reorderAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('overstocked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'overstocked' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overstocked ({overstockedAlerts.length})
          </button>
        </div>
      </div>

      {/* ALERTS GRID */}
      {displayedAlerts.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <PackageCheck className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Alerts in Selected Category!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your stock levels in this category are operating within optimal threshold limits.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedAlerts.map(alert => {
            const product = productMetrics.find(p => p.productId === alert.productId);

            return (
              <div 
                key={alert.id}
                className={`p-5 rounded-2xl border ${getAlertCardStyle(alert.type)} flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase tracking-wider ${getAlertBadge(alert.type)}`}>
                        {alert.type.replace('_', ' ')}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 mt-2">{alert.productName}</h3>
                      <p className="text-xs text-slate-500">{alert.category}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-black text-slate-900">{alert.currentStock}</span>
                      <span className="text-[10px] text-slate-500 block uppercase font-semibold">Current Stock</span>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed font-medium pt-1">
                    {alert.reason}
                  </p>
                </div>

                <div className="pt-3 border-t border-black/10 flex items-center justify-between">
                  <div className="text-xs font-semibold">
                    <span className="text-slate-500">Avg Sales: </span>
                    <span className="text-slate-900">{alert.avgDailySales} units/day</span>
                  </div>

                  <button 
                    onClick={() => product && setSelectedProductDetail(product)}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    {alert.actionText} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
