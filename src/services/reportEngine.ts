import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProductMetrics, ForecastResult, AppSettings } from '../types/inventory';

export function exportMetricsToCSV(metrics: ProductMetrics[], filename: string = 'inventory_report.csv') {
  const headers = [
    'Product Name',
    'SKU',
    'Category',
    'Current Stock',
    'Unit Price',
    'Inventory Value',
    'Avg Daily Sales',
    'Days Remaining',
    'Reorder Point',
    'Status'
  ];

  const rows = metrics.map(m => [
    `"${m.productName.replace(/"/g, '""')}"`,
    `"${m.sku}"`,
    `"${m.category}"`,
    m.currentStock,
    m.unitPrice,
    m.inventoryValue,
    m.avgDailySales,
    m.daysOfInventoryRemaining === 999 ? 'N/A' : m.daysOfInventoryRemaining,
    m.reorderPoint,
    `"${m.status}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generatePDFReport(
  reportType: string,
  metrics: ProductMetrics[],
  settings: AppSettings,
  forecasts?: ForecastResult[]
) {
  const doc = new jsPDF();
  const symbol = settings.currencySymbol || '₹';
  const businessName = settings.businessName || 'My Business';

  // Title & Header Styling
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42); // Deep navy
  doc.text('InventoryIQ Business Intelligence', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(`Report: ${reportType} | Business: ${businessName} | Date: ${new Date().toLocaleDateString()}`, 14, 28);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 32, 196, 32);

  // Summary Metrics Section
  const totalValue = metrics.reduce((acc, m) => acc + m.inventoryValue, 0);
  const totalProducts = metrics.length;
  const criticalCount = metrics.filter(m => m.status === 'Critical').length;
  const reorderCount = metrics.filter(m => m.status === 'Reorder Soon').length;

  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`Total Products: ${totalProducts} | Total Inventory Value: ${symbol}${totalValue.toLocaleString()} | Low Stock: ${criticalCount + reorderCount}`, 14, 40);

  let tableHead: string[][] = [];
  let tableData: (string | number)[][] = [];

  if (reportType.includes('Forecast') && forecasts) {
    tableHead = [['Product', 'Category', 'Current Stock', 'Avg Daily Demand', 'Predicted Demand', 'Trend', 'Confidence']];
    tableData = forecasts.map(f => [
      f.productName,
      f.category,
      f.currentStock,
      f.avgDailyDemand,
      f.predictedTotalDemand,
      f.demandTrend,
      `${f.confidenceLevel}%`
    ]);
  } else if (reportType.includes('Low Stock') || reportType.includes('Critical')) {
    const lowStockMetrics = metrics.filter(m => m.status === 'Critical' || m.status === 'Reorder Soon');
    tableHead = [['Product', 'SKU', 'Category', 'Stock', 'Avg Sales/Day', 'Days Left', 'Reorder Point', 'Status']];
    tableData = lowStockMetrics.map(m => [
      m.productName,
      m.sku,
      m.category,
      m.currentStock,
      m.avgDailySales,
      m.daysOfInventoryRemaining === 999 ? 'N/A' : m.daysOfInventoryRemaining,
      m.reorderPoint,
      m.status
    ]);
  } else if (reportType.includes('Overstock')) {
    const overstockMetrics = metrics.filter(m => m.status === 'Overstocked');
    tableHead = [['Product', 'SKU', 'Category', 'Current Stock', 'Avg Sales/Day', 'Inventory Value', 'Days Left']];
    tableData = overstockMetrics.map(m => [
      m.productName,
      m.sku,
      m.category,
      m.currentStock,
      m.avgDailySales,
      `${symbol}${m.inventoryValue.toLocaleString()}`,
      m.daysOfInventoryRemaining === 999 ? '300+' : m.daysOfInventoryRemaining
    ]);
  } else {
    // Default Inventory Summary
    tableHead = [['Product', 'Category', 'Stock', 'Unit Price', 'Total Value', 'Sales/Day', 'Status']];
    tableData = metrics.map(m => [
      m.productName,
      m.category,
      m.currentStock,
      `${symbol}${m.unitPrice}`,
      `${symbol}${m.inventoryValue.toLocaleString()}`,
      m.avgDailySales,
      m.status
    ]);
  }

  autoTable(doc, {
    startY: 46,
    head: tableHead,
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229], // Indigo accent
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    }
  });

  doc.save(`${reportType.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`);
}
