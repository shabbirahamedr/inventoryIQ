import React, { useState } from 'react';
import { 
  Plus, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Package, 
  Eye, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { exportMetricsToCSV, generatePDFReport } from '../services/reportEngine';

export const InventoryPage: React.FC = () => {
  const { 
    productMetrics, 
    setIsAddProductModalOpen, 
    setIsImportModalOpen, 
    setSelectedProductDetail,
    deleteProduct,
    settings 
  } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'value' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const symbol = settings.currencySymbol || '₹';

  const categories = ['All', ...Array.from(new Set(productMetrics.map(p => p.category)))];

  // Filtering
  const filtered = productMetrics.filter(p => {
    const matchesSearch = p.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    let comp = 0;
    if (sortBy === 'name') comp = a.productName.localeCompare(b.productName);
    else if (sortBy === 'stock') comp = a.currentStock - b.currentStock;
    else if (sortBy === 'value') comp = a.inventoryValue - b.inventoryValue;
    else if (sortBy === 'price') comp = a.unitPrice - b.unitPrice;

    return sortOrder === 'asc' ? comp : -comp;
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginatedProducts = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Healthy': return 'badge-healthy';
      case 'Monitor': return 'badge-monitor';
      case 'Reorder Soon': return 'badge-reorder';
      case 'Critical': return 'badge-critical';
      case 'Overstocked': return 'badge-overstocked';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleExportCSV = () => {
    exportMetricsToCSV(sorted, 'inventory_master_report.csv');
  };

  const handleExportPDF = () => {
    generatePDFReport('Inventory Summary', sorted, settings);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Inventory Management</h2>
          <p className="text-xs text-slate-500 mt-1">Monitor real-time stock levels, reorder thresholds, and inventory value</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setIsAddProductModalOpen(true)} 
            className="btn-primary text-xs"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>

          <button 
            onClick={() => setIsImportModalOpen(true)} 
            className="btn-secondary text-xs"
          >
            <Upload className="w-4 h-4" /> Import CSV/Excel
          </button>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button onClick={handleExportCSV} className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-white rounded-lg transition-all">
              CSV
            </button>
            <button onClick={handleExportPDF} className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-white rounded-lg transition-all">
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="neu-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name or SKU..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none"
          >
            {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
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

        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none"
          >
            <option value="name">Product Name</option>
            <option value="stock">Current Stock</option>
            <option value="value">Inventory Value</option>
            <option value="price">Unit Price</option>
          </select>

          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="neu-card overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Reorder Level</th>
                <th>Unit Price</th>
                <th>Inventory Value</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500 text-xs">
                    <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span>No inventory products match the filter criteria.</span>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map(p => (
                  <tr 
                    key={p.productId}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td onClick={() => setSelectedProductDetail(p)}>
                      <p className="font-bold text-slate-900">{p.productName}</p>
                    </td>
                    <td onClick={() => setSelectedProductDetail(p)} className="text-slate-500 font-mono text-xs">
                      {p.sku}
                    </td>
                    <td onClick={() => setSelectedProductDetail(p)} className="text-slate-700 font-medium">
                      {p.category}
                    </td>
                    <td onClick={() => setSelectedProductDetail(p)} className="font-bold text-slate-900">
                      {p.currentStock}
                    </td>
                    <td onClick={() => setSelectedProductDetail(p)} className="text-slate-500 font-medium">
                      {p.reorderPoint}
                    </td>
                    <td onClick={() => setSelectedProductDetail(p)} className="font-semibold text-slate-800">
                      {symbol}{p.unitPrice}
                    </td>
                    <td onClick={() => setSelectedProductDetail(p)} className="font-bold text-indigo-600">
                      {symbol}{p.inventoryValue.toLocaleString()}
                    </td>
                    <td onClick={() => setSelectedProductDetail(p)}>
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="text-right space-x-1">
                      <button 
                        onClick={() => setSelectedProductDetail(p)} 
                        className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteProduct(p.productId); }} 
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden p-4 space-y-3">
          {paginatedProducts.map(p => (
            <div 
              key={p.productId} 
              onClick={() => setSelectedProductDetail(p)}
              className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{p.productName}</h4>
                  <p className="text-xs text-slate-500">{p.sku} | {p.category}</p>
                </div>
                <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${getStatusBadge(p.status)}`}>
                  {p.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-medium">Stock</span>
                  <span className="font-bold text-slate-900">{p.currentStock}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-medium">Price</span>
                  <span className="font-bold text-slate-800">{symbol}{p.unitPrice}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-medium">Value</span>
                  <span className="font-bold text-indigo-600">{symbol}{p.inventoryValue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            Showing {paginatedProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, sorted.length)} of {sorted.length} items
          </span>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
