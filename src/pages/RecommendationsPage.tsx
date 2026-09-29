import React, { useState } from 'react';
import { 
  Lightbulb, 
  ShoppingCart, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingDown, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  Eye,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { RecommendationType, InventoryRecommendation } from '../types/inventory';

export const RecommendationsPage: React.FC = () => {
  const { recommendations, productMetrics, updateProduct, setSelectedProductDetail, settings } = useInventory();
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | RecommendationType>('ALL');
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const symbol = settings.currencySymbol || '₹';

  const filteredRecs = recommendations.filter(rec => {
    const matchesPriority = priorityFilter === 'ALL' || rec.priority === priorityFilter;
    const matchesType = typeFilter === 'ALL' || rec.type === typeFilter;
    return matchesPriority && matchesType;
  });

  const highPriorityCount = recommendations.filter(r => r.priority === 'HIGH').length;
  const reorderCount = recommendations.filter(r => r.type === 'REORDER').length;
  const overstockCount = recommendations.filter(r => r.type === 'REDUCE_PURCHASE').length;
  const totalSuggestedUnits = recommendations
    .filter(r => r.type === 'REORDER')
    .reduce((sum, r) => sum + r.recommendedQty, 0);

  const handleQuickRestock = (rec: InventoryRecommendation) => {
    const metric = productMetrics.find(m => m.productId === rec.productId);
    if (!metric) return;

    const newStock = metric.currentStock + rec.recommendedQty;
    updateProduct(rec.productId, { currentStock: newStock });
    setOrderedIds(prev => [...prev, rec.id]);
    setSuccessToast(`Ordered & restocked +${rec.recommendedQty} units for ${rec.productName}!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const getPriorityBadge = (priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (priority) {
      case 'HIGH':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">High Priority</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">Medium</span>;
      case 'LOW':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">Low</span>;
    }
  };

  const getTypeBadge = (type: RecommendationType) => {
    switch (type) {
      case 'REORDER':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">Reorder Required</span>;
      case 'REDUCE_PURCHASE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">Hold Purchasing</span>;
      case 'MONITOR':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">Monitor Velocity</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{successToast}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 md:p-8 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            AI Decision Support System
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Smart Purchasing & Restock Recommendations</h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Automated intelligence analyzes your daily sales run-rate, lead times, safety stock, and demand horizons to generate optimal purchase quantities and stop over-ordering.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="neu-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Urgent Reorders</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{highPriorityCount}</p>
          <p className="text-xs text-rose-600 mt-1 font-medium">Critical items needing PO today</p>
        </div>

        <div className="neu-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Suggested Units</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{totalSuggestedUnits.toLocaleString()}</p>
          <p className="text-xs text-indigo-600 mt-1 font-medium">Units across {reorderCount} products</p>
        </div>

        <div className="neu-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overstock Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{overstockCount}</p>
          <p className="text-xs text-amber-600 mt-1 font-medium">Capital tied in slow inventory</p>
        </div>

        <div className="neu-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Optimization Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {productMetrics.length > 0 ? Math.round(((productMetrics.length - highPriorityCount) / productMetrics.length) * 100) : 100}%
          </p>
          <p className="text-xs text-emerald-600 mt-1 font-medium">Inventory health score</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="neu-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Filter By:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Action Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Actions</option>
              <option value="REORDER">Reorder Required</option>
              <option value="REDUCE_PURCHASE">Hold Purchasing</option>
              <option value="MONITOR">Monitor Velocity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecs.length === 0 ? (
          <div className="col-span-full neu-card p-12 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="font-semibold text-slate-800 text-base">No matching recommendations found</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting your filters or adjusting your inventory levels.</p>
          </div>
        ) : (
          filteredRecs.map(rec => {
            const metric = productMetrics.find(m => m.productId === rec.productId);
            const isOrdered = orderedIds.includes(rec.id);

            return (
              <div 
                key={rec.id} 
                className={`neu-card p-5 flex flex-col justify-between transition-all duration-200 ${
                  rec.priority === 'HIGH' ? 'border-l-4 border-l-rose-500' : 
                  rec.priority === 'MEDIUM' ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-indigo-500'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getPriorityBadge(rec.priority)}
                        {getTypeBadge(rec.type)}
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">{rec.productName}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Category: {rec.category}</p>
                    </div>

                    {metric && (
                      <button
                        onClick={() => setSelectedProductDetail(metric)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View Detailed Analytics"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {rec.reason}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="p-2.5 rounded-lg bg-slate-100/70">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Current Stock</span>
                      <span className="text-sm font-bold text-slate-800">{rec.currentStock} units</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-100/70">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Est. Demand</span>
                      <span className="text-sm font-bold text-slate-800">{rec.predictedDemand} units</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100">
                      <span className="text-[10px] text-indigo-700 uppercase font-semibold block">Recommended PO</span>
                      <span className="text-sm font-extrabold text-indigo-700">
                        {rec.recommendedQty > 0 ? `+${rec.recommendedQty}` : '0'} units
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    {metric && (
                      <span>Unit Cost: <strong className="text-slate-700">{symbol}{metric.unitPrice}</strong></span>
                    )}
                  </div>

                  {rec.type === 'REORDER' ? (
                    <button
                      onClick={() => handleQuickRestock(rec)}
                      disabled={isOrdered}
                      className={`btn-primary py-2 px-3.5 text-xs shadow-sm ${
                        isOrdered ? 'opacity-60 cursor-not-allowed bg-emerald-600 hover:bg-emerald-600' : ''
                      }`}
                    >
                      {isOrdered ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Restocked</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Order +{rec.recommendedQty} Units</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => metric && setSelectedProductDetail(metric)}
                      className="btn-secondary py-2 px-3 text-xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Review Item</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
