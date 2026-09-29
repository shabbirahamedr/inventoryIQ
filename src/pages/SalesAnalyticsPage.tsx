import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Sparkles, 
  Lightbulb, 
  ArrowUpRight, 
  ArrowDownRight,
  BarChart2,
  PieChart as PieIcon
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  Legend 
} from 'recharts';

export const SalesAnalyticsPage: React.FC = () => {
  const { productMetrics, sales, settings } = useInventory();

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedProductId, setSelectedProductId] = useState('All');

  const symbol = settings.currencySymbol || '₹';

  // 1. Filter Sales
  const filteredSales = sales.filter(s => {
    const matchesCat = categoryFilter === 'All' || s.category === categoryFilter;
    const matchesProd = selectedProductId === 'All' || s.productId === selectedProductId;
    return matchesCat && matchesProd;
  });

  // 2. Total Sales & Units Over Time Data
  const dailyMap: { [date: string]: { revenue: number; units: number } } = {};
  filteredSales.forEach(s => {
    if (!dailyMap[s.date]) dailyMap[s.date] = { revenue: 0, units: 0 };
    dailyMap[s.date].revenue += Number(s.revenue) || 0;
    dailyMap[s.date].units += Number(s.quantitySold) || 0;
  });

  const sortedDates = Object.keys(dailyMap).sort().slice(-30);
  const timeSeriesData = sortedDates.map(d => ({
    date: d.slice(5),
    revenue: dailyMap[d].revenue,
    units: dailyMap[d].units
  }));

  // 3. Revenue by Category
  const catRevMap: { [cat: string]: number } = {};
  productMetrics.forEach(p => {
    catRevMap[p.category] = (catRevMap[p.category] || 0) + p.totalRevenue;
  });

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6'];
  const categoryChartData = Object.keys(catRevMap).map((cat, i) => ({
    name: cat,
    value: catRevMap[cat],
    color: COLORS[i % COLORS.length]
  }));

  // 4. Top Selling Products (by Revenue)
  const topProducts = [...productMetrics]
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  // 5. Slow Moving Products (lowest sales velocity)
  const slowProducts = [...productMetrics]
    .sort((a, b) => a.avgDailySales - b.avgDailySales)
    .slice(0, 5);

  // 6. Data-Driven Key Insights Generator
  const topProd = topProducts[0];
  const topCategory = categoryChartData.sort((a, b) => b.value - a.value)[0];
  const totalRevenue = productMetrics.reduce((acc, p) => acc + p.totalRevenue, 0);

  const insights = [
    topProd ? `"${topProd.productName}" generated the highest revenue of ${symbol}${topProd.totalRevenue.toLocaleString()} during the analyzed period.` : '',
    topCategory ? `${topCategory.name} is your top-performing category contributing ${Math.round((topCategory.value / (totalRevenue || 1)) * 100)}% of overall sales.` : '',
    slowProducts.length > 0 ? `"${slowProducts[0].productName}" has the lowest sales velocity at ${slowProducts[0].avgDailySales} units/day.` : '',
    `Average daily store sales revenue stands at ${symbol}${Math.round(totalRevenue / 30).toLocaleString()} per day.`
  ].filter(Boolean);

  const categories = ['All', ...Array.from(new Set(productMetrics.map(p => p.category)))];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Sales Analytics Intelligence</h2>
          <p className="text-xs text-slate-500 mt-1">Deep dive into sales velocity, category revenue breakdown, and product performance</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
          >
            {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
        </div>
      </div>

      {/* KEY DATA INSIGHTS CARD */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-sm uppercase tracking-wider text-indigo-200">Data-Driven Key Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {insights.map((insight, idx) => (
            <div key={idx} className="p-3 bg-white/10 rounded-xl border border-white/10 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-slate-100">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CHARTS GRID ROW 1: Revenue Over Time & Units Sold Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Total Sales Over Time */}
        <div className="neu-card p-6">
          <h3 className="font-bold text-base text-slate-900 mb-1">Total Sales Revenue Over Time</h3>
          <p className="text-xs text-slate-500 mb-4">Daily revenue progression over the past 30 days</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradAnalytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(val) => `${symbol}${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`} />
                <Tooltip formatter={(val: any) => [`${symbol}${Number(val).toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGradAnalytics)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Units Sold Over Time */}
        <div className="neu-card p-6">
          <h3 className="font-bold text-base text-slate-900 mb-1">Units Sold Over Time</h3>
          <p className="text-xs text-slate-500 mb-4">Volume of product units sold daily</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip formatter={(val: any) => [`${val} units`, 'Units Sold']} />
                <Bar dataKey="units" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHARTS GRID ROW 2: Revenue By Category & Top/Slow Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 3: Revenue By Category */}
        <div className="neu-card p-6">
          <h3 className="font-bold text-base text-slate-900 mb-1">Revenue by Category</h3>
          <p className="text-xs text-slate-500 mb-2">Category revenue contribution breakdown</p>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cat-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${symbol}${Number(val).toLocaleString()}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 text-xs border-t border-slate-100 pt-3">
            {categoryChartData.map(c => (
              <div key={c.name} className="flex items-center justify-between text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span>{c.name}</span>
                </div>
                <span className="font-bold">{symbol}{c.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4 & List: Top-Selling Products */}
        <div className="neu-card p-6">
          <h3 className="font-bold text-base text-slate-900 mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Top-Selling Products
          </h3>
          <p className="text-xs text-slate-500 mb-4">Highest revenue generators in inventory</p>

          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.productId} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                    #{i + 1}
                  </span>
                  <div>
                    <p className="font-bold text-xs text-slate-900">{p.productName}</p>
                    <p className="text-[10px] text-slate-400">{p.category} | {p.totalUnitsSold} sold</p>
                  </div>
                </div>
                <span className="font-bold text-xs text-emerald-600">
                  {symbol}{p.totalRevenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 5 & List: Slow-Moving Products */}
        <div className="neu-card p-6">
          <h3 className="font-bold text-base text-slate-900 mb-1 flex items-center gap-2">
            <ArrowDownRight className="w-4 h-4 text-rose-600" /> Slow-Moving Products
          </h3>
          <p className="text-xs text-slate-500 mb-4">Items with lowest sales velocity</p>

          <div className="space-y-3">
            {slowProducts.map((p, i) => (
              <div key={p.productId} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-slate-900">{p.productName}</p>
                  <p className="text-[10px] text-slate-400">{p.category} | Stock: {p.currentStock}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-xs text-slate-800">{p.avgDailySales} / day</span>
                  <span className="block text-[10px] text-rose-500 font-semibold">{p.salesVelocity} Velocity</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
