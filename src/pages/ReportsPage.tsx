import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Printer, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  Sparkles,
  BarChart3,
  Layers
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { exportMetricsToCSV, generatePDFReport } from '../services/reportEngine';
import { forecastProductDemand } from '../services/forecastingEngine';

export const ReportsPage: React.FC = () => {
  const { productMetrics, products, sales, settings } = useInventory();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [selectedReportType, setSelectedReportType] = useState<string>('Inventory Valuation Summary');

  const symbol = settings.currencySymbol || '₹';

  const triggerToast = (msg: string) => {
    setDownloadSuccess(msg);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  const handleDownloadPDF = (type: string) => {
    // If it's a forecast report, generate forecast results
    let forecasts = undefined;
    if (type.includes('Forecast')) {
      forecasts = products.map(p => forecastProductDemand(p, sales, 14, 30));
    }

    generatePDFReport(type, productMetrics, settings, forecasts);
    triggerToast(`Downloaded ${type} (PDF) successfully!`);
  };

  const handleDownloadCSV = (filename: string) => {
    exportMetricsToCSV(productMetrics, filename);
    triggerToast(`Downloaded ${filename} (CSV) successfully!`);
  };

  const totalValue = productMetrics.reduce((sum, m) => sum + m.inventoryValue, 0);
  const totalRevenue = productMetrics.reduce((sum, m) => sum + m.totalRevenue, 0);
  const lowStockCount = productMetrics.filter(m => m.status === 'Critical' || m.status === 'Reorder Soon').length;
  const overstockCount = productMetrics.filter(m => m.status === 'Overstocked').length;

  const reportCards = [
    {
      title: 'Inventory Valuation Summary',
      description: 'Comprehensive audit of all active SKUs, current stock on hand, individual valuation, and overall holding value.',
      badge: 'Most Popular',
      pdfType: 'Inventory Valuation Summary',
      csvFile: 'inventory_valuation_report.csv',
      icon: BarChart3,
      color: 'indigo'
    },
    {
      title: 'Low Stock & Critical Replenishment',
      description: 'Urgent procurement dispatch detailing products that have breached safety thresholds or risk imminent stockouts.',
      badge: `${lowStockCount} Items At Risk`,
      pdfType: 'Low Stock Replenishment Report',
      csvFile: 'low_stock_critical_report.csv',
      icon: AlertTriangle,
      color: 'rose'
    },
    {
      title: 'Overstocked & Dead Stock Analysis',
      description: 'Identifies slow-moving products with more than 60 days of inventory run-rate to optimize tied-up working capital.',
      badge: `${overstockCount} Products Flagged`,
      pdfType: 'Overstocked Products Analysis',
      csvFile: 'overstock_capital_report.csv',
      icon: TrendingUp,
      color: 'amber'
    },
    {
      title: '14-Day Demand Forecast Intelligence',
      description: 'Predictive forecast based on 30-day sales moving averages, seasonal trends, and recommended reorder quantities.',
      badge: 'AI Forecast',
      pdfType: '14-Day Demand Forecast Intelligence',
      csvFile: 'demand_forecast_metrics.csv',
      icon: Sparkles,
      color: 'blue'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Download Alert Toast */}
      {downloadSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{downloadSuccess}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <Printer className="w-3.5 h-3.5" />
            Executive & Audit Reports
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Business Reports & Data Export</h2>
          <p className="text-slate-500 text-sm mt-1">
            Export formatted, print-ready PDF briefs and raw CSV files for accounting, suppliers, and management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleDownloadCSV('inventory_export_all.csv')}
            className="btn-secondary py-2 px-3 text-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export All CSV</span>
          </button>
          <button
            onClick={() => handleDownloadPDF('Full Inventory Summary')}
            className="btn-primary py-2 px-3.5 text-xs shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Generate Executive PDF</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="neu-card p-4">
          <span className="text-[11px] text-slate-500 font-semibold uppercase">Total Tracked SKUs</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{productMetrics.length}</p>
          <span className="text-[11px] text-slate-400">In database</span>
        </div>
        <div className="neu-card p-4">
          <span className="text-[11px] text-slate-500 font-semibold uppercase">Total Inventory Asset</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{symbol}{totalValue.toLocaleString()}</p>
          <span className="text-[11px] text-indigo-600 font-medium">Current valuation</span>
        </div>
        <div className="neu-card p-4">
          <span className="text-[11px] text-slate-500 font-semibold uppercase">30-Day Sales Volume</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{symbol}{totalRevenue.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Recorded revenue</span>
        </div>
        <div className="neu-card p-4">
          <span className="text-[11px] text-slate-500 font-semibold uppercase">Restock Urgency</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{lowStockCount} items</p>
          <span className="text-[11px] text-rose-600 font-medium">Breached reorder level</span>
        </div>
      </div>

      {/* Ready-To-Download Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reportCards.map((rc, idx) => {
          const Icon = rc.icon;
          return (
            <div key={idx} className="neu-card p-6 flex flex-col justify-between hover:border-indigo-200 transition-all">
              <div>
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    rc.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                    rc.color === 'rose' ? 'bg-rose-50 text-rose-600' :
                    rc.color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {rc.badge}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-lg mt-4">{rc.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{rc.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleDownloadCSV(rc.csvFile)}
                  className="btn-secondary py-2 px-3 text-xs flex-1 justify-center"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>CSV File</span>
                </button>
                <button
                  onClick={() => handleDownloadPDF(rc.pdfType)}
                  className="btn-primary py-2 px-3 text-xs flex-1 justify-center shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Data Preview Section */}
      <div className="neu-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Current Report Data Snapshot</h3>
            <p className="text-xs text-slate-500">Live preview of records included in the generated reports.</p>
          </div>
          <span className="text-xs font-medium text-slate-500">Showing top 8 items</span>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Unit Price</th>
                <th>Total Value</th>
                <th>Daily Sales</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {productMetrics.slice(0, 8).map(m => (
                <tr key={m.productId}>
                  <td className="font-semibold text-slate-900">{m.productName}</td>
                  <td className="text-xs text-slate-500 font-mono">{m.sku}</td>
                  <td><span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700">{m.category}</span></td>
                  <td className="font-medium text-slate-800">{m.currentStock} units</td>
                  <td>{symbol}{m.unitPrice}</td>
                  <td className="font-bold text-slate-900">{symbol}{m.inventoryValue.toLocaleString()}</td>
                  <td>{m.avgDailySales} / day</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      m.status === 'Healthy' ? 'bg-emerald-100 text-emerald-700' :
                      m.status === 'Critical' ? 'bg-rose-100 text-rose-700' :
                      m.status === 'Reorder Soon' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
