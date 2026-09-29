import React, { useState } from 'react';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  Search,
  Filter,
  Layers,
  ChevronRight,
  Eye,
  BarChart3,
  Calendar
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { 
    productMetrics, 
    sales, 
    settings, 
    dateFilter, 
    setDateFilter, 
    setSelectedProductDetail 
  } = useInventory();

  const [timeView, setTimeView] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const symbol = settings.currencySymbol || '₹';

  // 1. KPI Calculations
  const totalProducts = productMetrics.length;
  const totalSalesRevenue = productMetrics.reduce((acc, m) => acc + m.totalRevenue, 0);
  const totalInventoryValue = productMetrics.reduce((acc, m) => acc + m.inventoryValue, 0);
  const lowStockCount = productMetrics.filter(m => m.status === 'Critical' || m.status === 'Reorder Soon').length;

  // 2. Sales Trend Chart Data (Grouping sales by date)
  const salesByDateMap: { [date: string]: number } = {};
  sales.forEach(s => {
    salesByDateMap[s.date] = (salesByDateMap[s.date] || 0) + (Number(s.revenue) || 0);
  });

  const sortedSalesDates = Object.keys(salesByDateMap).sort();
  const rawChartData = sortedSalesDates.slice(-30).map(d => ({
    date: d.slice(5),
    revenue: salesByDateMap[d]
  }));

  // 3. Inventory Health Breakdown (Donut Chart)
  const healthyCount = productMetrics.filter(m => m.status === 'Healthy').length;
  const monitorCount = productMetrics.filter(m => m.status === 'Monitor').length;
  const reorderCount = productMetrics.filter(m => m.status === 'Reorder Soon').length;
  const criticalCount = productMetrics.filter(m => m.status === 'Critical').length;
  const overstockedCount = productMetrics.filter(m => m.status === 'Overstocked').length;

  const healthChartData = [
    { name: 'Healthy', value: healthyCount, color: '#10B981' },
    { name: 'Monitor', value: monitorCount, color: '#F59E0B' },
    { name: 'Reorder Soon', value: reorderCount, color: '#F97316' },
    { name: 'Critical', value: criticalCount, color: '#F43F5E' },
    { name: 'Overstocked', value: overstockedCount, color: '#64748B' }
  ];

  // 4. Product Performance Table Filtering
  const categories = ['All', ...Array.from(new Set(productMetrics.map(p => p.category)))];

  const filteredProducts = productMetrics.filter(p => {
    const matchesSearch = p.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Healthy': return 'badge-healthy';
      case 'Monitor': return 'badge-monitor';
      case 'Reorder Soon': return 'badge-reorder';
      case 'Critical': return 'badge-critical';
      case 'Overstocked': return 'badge-overstocked';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Good morning, {settings.businessName} 👋
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Here's your inventory overview and today's important insights.
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 self-start sm:self-auto">
          {(['Today', '7 Days', '30 Days', '90 Days'] as const).map(f => (
            <button
              key={f}
              onClick={() => setDateFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dateFilter === f 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* 4 KPI CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Products */}
        <div className="neu-card p-5 neu-card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Products</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900">{totalProducts.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +8.4% vs previous period
            </div>
          </div>
        </div>

        {/* Card 2: Total Sales */}
        <div className="neu-card p-5 neu-card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sales</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900">{symbol}{totalSalesRevenue.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12.3% revenue velocity
            </div>
          </div>
        </div>

        {/* Card 3: Inventory Value */}
        <div className="neu-card p-5 neu-card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inventory Value</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900">{symbol}{totalInventoryValue.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mt-1">
              Asset value across {totalProducts} items
            </div>
          </div>
        </div>

        {/* Card 4: Low Stock Items */}
        <div className="neu-card p-5 neu-card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Low Stock Items</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900">{lowStockCount}</div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 mt-1">
              {criticalCount} Critical | {reorderCount} Reorder Soon
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD ANALYTICS (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT LARGE CARD: Sales Overview */}
        <div className="lg:col-span-2 neu-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Sales Overview</h3>
              <p className="text-xs text-slate-500">Historical sales revenue over time</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {(['Daily', 'Weekly', 'Monthly'] as const).map(tv => (
                <button
                  key={tv}
                  onClick={() => setTimeView(tv)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                    timeView === tv ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  {tv}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rawChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradOverview" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(val) => `${symbol}${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`} />
                <Tooltip 
                  formatter={(val: any) => [`${symbol}${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGradOverview)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT CARD: Inventory Health */}
        <div className="neu-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">Inventory Health</h3>
            <p className="text-xs text-slate-500">Stock classification breakdown</p>
          </div>

          <div className="h-44 my-2 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {healthChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val} items`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900">{totalProducts}</span>
              <span className="text-[10px] uppercase block font-semibold text-slate-400">Total Items</span>
            </div>
          </div>

          {/* Health Legend Pills */}
          <div className="space-y-1.5 text-xs">
            {healthChartData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="font-bold">{item.value} ({Math.round((item.value/totalProducts)*100 || 0)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRODUCT PERFORMANCE SECTION */}
      <div className="neu-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Product Performance</h3>
            <p className="text-xs text-slate-500">Real-time units sold, revenue, stock levels, and demand trends</p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none"
            >
              {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
            </select>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Healthy">Healthy</option>
              <option value="Monitor">Monitor</option>
              <option value="Reorder Soon">Reorder Soon</option>
              <option value="Critical">Critical</option>
              <option value="Overstocked">Overstocked</option>
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Units Sold</th>
                <th>Revenue</th>
                <th>Current Stock</th>
                <th>Demand Trend</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500 text-xs">
                    No matching products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.slice(0, 10).map((p) => (
                  <tr 
                    key={p.productId} 
                    onClick={() => setSelectedProductDetail(p)}
                    className="cursor-pointer"
                  >
                    <td>
                      <div>
                        <p className="font-semibold text-slate-900">{p.productName}</p>
                        <p className="text-[11px] text-slate-400">SKU: {p.sku}</p>
                      </div>
                    </td>
                    <td className="text-slate-600 font-medium">{p.category}</td>
                    <td className="font-bold text-slate-800">{p.totalUnitsSold.toLocaleString()}</td>
                    <td className="font-bold text-indigo-600">{symbol}{p.totalRevenue.toLocaleString()}</td>
                    <td>
                      <span className={`font-bold ${p.currentStock <= p.reorderPoint ? 'text-rose-600' : 'text-slate-900'}`}>
                        {p.currentStock}
                      </span>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold">
                        {p.demandTrend === 'Increasing' && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />}
                        {p.demandTrend === 'Decreasing' && <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />}
                        {p.demandTrend === 'Stable' && <Minus className="w-3.5 h-3.5 text-amber-600" />}
                        {p.demandTrend}
                      </span>
                    </td>
                    <td>
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusBadgeClass(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {filteredProducts.slice(0, 10).map((p) => (
            <div 
              key={p.productId} 
              onClick={() => setSelectedProductDetail(p)}
              className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 cursor-pointer hover:bg-slate-100/80 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{p.productName}</h4>
                  <p className="text-xs text-slate-500">{p.category} | {p.sku}</p>
                </div>
                <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${getStatusBadgeClass(p.status)}`}>
                  {p.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-medium">Sold</span>
                  <span className="font-bold text-slate-900">{p.totalUnitsSold}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-medium">Revenue</span>
                  <span className="font-bold text-indigo-600">{symbol}{p.totalRevenue.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-medium">Stock</span>
                  <span className="font-bold text-slate-900">{p.currentStock}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
