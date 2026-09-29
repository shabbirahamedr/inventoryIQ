import React, { useState, useMemo } from 'react';
import { 
  LineChart as LineIcon, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle,
  Sparkles,
  Calendar,
  Layers
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { forecastProductDemand } from '../services/forecastingEngine';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';

export const DemandForecastPage: React.FC = () => {
  const { products, sales, settings } = useInventory();

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [forecastHorizon, setForecastHorizon] = useState<number>(14); // 7, 14, 30

  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || products[0];
  }, [products, selectedProductId]);

  const forecastResult = useMemo(() => {
    if (!selectedProduct) return null;
    return forecastProductDemand(selectedProduct, sales, forecastHorizon, 30);
  }, [selectedProduct, sales, forecastHorizon]);

  if (!selectedProduct || !forecastResult) {
    return <div className="p-8 text-center text-slate-500">No products available for forecasting.</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <LineIcon className="w-5 h-5 text-indigo-600" /> Demand Forecast Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1">Estimate future product demand using historical sales patterns & exponential smoothing</p>
        </div>

        {/* Product & Horizon Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Product Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Product:</span>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none max-w-xs truncate"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
              ))}
            </select>
          </div>

          {/* Forecast Horizon Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {[7, 14, 30].map(h => (
              <button
                key={h}
                onClick={() => setForecastHorizon(h)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  forecastHorizon === h 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {h} Days
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* METRIC CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Avg Daily Demand */}
        <div className="neu-card p-5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Avg Daily Demand</span>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {forecastResult.avgDailyDemand} <span className="text-xs font-semibold text-slate-400">units/day</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Baseline sales pace</span>
        </div>

        {/* Metric 2: Predicted Total Demand */}
        <div className="neu-card p-5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Predicted {forecastHorizon}-Day Demand
          </span>
          <div className="text-2xl font-black text-indigo-600 mt-2">
            {forecastResult.predictedTotalDemand} <span className="text-xs font-semibold text-indigo-400">units</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Current Available Stock: {forecastResult.currentStock}</span>
        </div>

        {/* Metric 3: Demand Trend */}
        <div className="neu-card p-5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Demand Trend</span>
          <div className="text-2xl font-black text-slate-900 mt-2 flex items-center gap-1.5">
            {forecastResult.demandTrend === 'Increasing' && <ArrowUpRight className="w-6 h-6 text-emerald-600" />}
            {forecastResult.demandTrend === 'Decreasing' && <ArrowDownRight className="w-6 h-6 text-rose-600" />}
            {forecastResult.demandTrend === 'Stable' && <Minus className="w-6 h-6 text-amber-600" />}
            {forecastResult.demandTrend}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Momentum calculation</span>
        </div>

        {/* Metric 4: Forecast Reliability */}
        <div className="neu-card p-5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Confidence Indicator</span>
          <div className="text-2xl font-black text-emerald-600 mt-2 flex items-center gap-1.5">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            {forecastResult.confidenceLevel}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Based on sales variance</span>
        </div>
      </div>

      {/* FORECAST VISUAL CHART */}
      <div className="neu-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              Historical Sales vs Predicted Demand Projection
            </h3>
            <p className="text-xs text-slate-500">
              Past 30 days actual sales (solid blue) connected to {forecastHorizon}-day future demand projection (dashed indigo)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-blue-600 rounded-full" />
              <span>Historical Sales</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-indigo-500 border border-dashed border-indigo-500 rounded-full" />
              <span>Predicted Forecast</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastResult.chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip 
                formatter={(val: any, name: any) => [
                  val !== null ? `${val} units` : 'N/A', 
                  name === 'historicalQuantity' ? 'Historical Sales' : 'Predicted Demand'
                ]}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} 
              />
              <Line 
                type="monotone" 
                dataKey="historicalQuantity" 
                stroke="#2563EB" 
                strokeWidth={2.5} 
                dot={false}
                name="historicalQuantity"
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="predictedQuantity" 
                stroke="#6366F1" 
                strokeWidth={2.5} 
                strokeDasharray="5 5" 
                dot={{ r: 3, fill: '#6366F1' }}
                name="predictedQuantity"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* FORECAST METHODOLOGY & STOCKOUT WARNING PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Forecasting Logic Explanation */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" /> Baseline Forecasting Methodology
          </div>
          <p className="text-slate-700 leading-relaxed">
            The baseline engine uses a Weighted Exponential Moving Average (EMA, \(\alpha=0.25\)) combined with linear slope momentum projected over day-of-week seasonal multipliers. 
          </p>
          <p className="text-slate-500 italic">
            Architecture Notice: The forecasting module is structured cleanly in <code className="bg-indigo-100/80 px-1 py-0.5 rounded text-indigo-800">src/services/forecastingEngine.ts</code> and can be seamlessly upgraded to advanced ML models (ARIMA, Prophet, LSTM) without altering UI components.
          </p>
        </div>

        {/* Right Col: Stockout Risk Status */}
        <div className={`p-5 rounded-2xl border text-xs space-y-2 flex flex-col justify-between ${
          forecastResult.stockoutDays !== null 
            ? 'bg-rose-50 border-rose-200 text-rose-900' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <div>
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle className={`w-4 h-4 ${forecastResult.stockoutDays !== null ? 'text-rose-600' : 'text-emerald-600'}`} />
              Stockout Risk Status
            </div>
            <p className="mt-2 leading-relaxed">
              {forecastResult.stockoutDays !== null ? (
                <>Warning: Predicted demand will deplete available stock ({forecastResult.currentStock} units) within <strong>{forecastResult.stockoutDays} days</strong>.</>
              ) : (
                <>Current stock ({forecastResult.currentStock} units) is sufficient to fulfill the predicted {forecastHorizon}-day demand.</>
              )}
            </p>
          </div>

          <div className="pt-2 font-bold uppercase text-[10px] tracking-wider border-t border-black/10">
            {forecastResult.stockoutDays !== null ? 'Reorder Recommended Immediately' : 'Stock Level Healthy'}
          </div>
        </div>
      </div>
    </div>
  );
};
