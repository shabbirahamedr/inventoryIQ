import React from 'react';
import { X, Package, TrendingUp, AlertTriangle, Calendar, Tag, ShieldAlert, DollarSign, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { ProductMetrics } from '../types/inventory';
import { useInventory } from '../context/InventoryContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface ProductDetailModalProps {
  product: ProductMetrics | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { sales, settings } = useInventory();
  if (!product) return null;

  const symbol = settings.currencySymbol || '₹';

  // Get past 30 days daily sales history for chart
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const prodSalesMap: { [date: string]: number } = {};
  for (let i = 30; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    prodSalesMap[ds] = 0;
  }

  sales
    .filter(s => s.productId === product.productId && s.date >= cutoffStr)
    .forEach(s => {
      if (prodSalesMap[s.date] !== undefined) {
        prodSalesMap[s.date] += Number(s.quantitySold) || 0;
      }
    });

  const chartData = Object.keys(prodSalesMap).sort().map(date => ({
    date: date.slice(5),
    units: prodSalesMap[date]
  }));

  const getStatusBadge = (status: ProductMetrics['status']) => {
    switch (status) {
      case 'Healthy': return 'badge-healthy';
      case 'Monitor': return 'badge-monitor';
      case 'Reorder Soon': return 'badge-reorder';
      case 'Critical': return 'badge-critical';
      case 'Overstocked': return 'badge-overstocked';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{product.productName}</h2>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusBadge(product.status)}`}>
                  {product.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">SKU: {product.sku} | Category: {product.category}</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Key Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Current Stock</span>
              <span className="text-xl font-bold text-slate-900">{product.currentStock}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">units in store</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Avg Daily Sales</span>
              <span className="text-xl font-bold text-slate-900">{product.avgDailySales}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">units / day</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Days Remaining</span>
              <span className="text-xl font-bold text-slate-900">
                {product.daysOfInventoryRemaining === 999 ? '300+' : `${product.daysOfInventoryRemaining}d`}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">stockout window</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Inventory Value</span>
              <span className="text-xl font-bold text-indigo-600">{symbol}{product.inventoryValue.toLocaleString()}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">@ {symbol}{product.unitPrice}/unit</span>
            </div>
          </div>

          {/* Deep Analytics Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-indigo-600" /> Reorder Parameters
              </h3>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Calculated Reorder Point:</span>
                <span className="font-semibold text-slate-800">{product.reorderPoint} units</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Lead Time:</span>
                <span className="font-semibold text-slate-800">{product.leadTime} days</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Safety Stock Buffer:</span>
                <span className="font-semibold text-slate-800">{product.safetyStock} units</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Min Order Quantity:</span>
                <span className="font-semibold text-slate-800">{product.minOrderQty} units</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" /> Demand Intelligence
              </h3>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Demand Trend:</span>
                <span className="font-semibold flex items-center gap-1 text-slate-800">
                  {product.demandTrend === 'Increasing' && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />}
                  {product.demandTrend === 'Decreasing' && <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />}
                  {product.demandTrend === 'Stable' && <Minus className="w-3.5 h-3.5 text-amber-600" />}
                  {product.demandTrend}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Sales Velocity:</span>
                <span className="font-semibold text-slate-800">{product.salesVelocity}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Stockout Risk:</span>
                <span className={`font-semibold ${product.stockoutRisk === 'High' ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
                  {product.stockoutRisk}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Overstock Risk:</span>
                <span className="font-semibold text-slate-800">{product.overstockRisk}</span>
              </div>
            </div>
          </div>

          {/* Historical Sales Area Chart */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">30-Day Daily Sales Velocity</h3>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="units" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button onClick={onClose} className="btn-secondary text-xs">
            Close View
          </button>
        </div>

      </div>
    </div>
  );
};
