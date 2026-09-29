import { Product, SalesRecord, ProductMetrics, StockAlert, InventoryRecommendation, StockStatus, RiskLevel, DemandTrend } from '../types/inventory';

export function calculateProductMetrics(
  product: Product,
  sales: SalesRecord[],
  daysWindow: number = 30
): ProductMetrics {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysWindow);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];

  // Filter sales for this product in window
  const prodSales = sales.filter(s => s.productId === product.id && s.date >= cutoffStr);

  const totalUnitsSold = prodSales.reduce((acc, s) => acc + (Number(s.quantitySold) || 0), 0);
  const totalRevenue = prodSales.reduce((acc, s) => acc + (Number(s.revenue) || (Number(s.quantitySold) * Number(s.unitPrice)) || 0), 0);

  const safeDays = Math.max(1, daysWindow);
  const avgDailySales = Number((totalUnitsSold / safeDays).toFixed(2));
  const avgWeeklySales = Number((avgDailySales * 7).toFixed(1));

  const inventoryValue = Number((product.currentStock * product.unitPrice).toFixed(2));

  // Days of inventory remaining calculation
  let daysOfInventoryRemaining = 999;
  if (avgDailySales > 0) {
    daysOfInventoryRemaining = Number((product.currentStock / avgDailySales).toFixed(1));
  } else if (product.currentStock === 0) {
    daysOfInventoryRemaining = 0;
  }

  // Safety stock = (Max Daily Sales * Max Lead Time) - (Avg Daily Sales * Avg Lead Time)
  // Simplified robust safety stock formula: ceil(avgDailySales * (leadTime * 0.5)) + min 2 units for safety
  const safetyStock = Math.max(2, Math.ceil(avgDailySales * (product.leadTime * 0.5)));

  // Reorder Point = (Avg Daily Demand * Lead Time) + Safety Stock
  const reorderPoint = Math.max(product.reorderLevel || 10, Math.ceil((avgDailySales * product.leadTime) + safetyStock));

  // Demand Trend Analysis (comparing recent half of window to older half)
  const midDate = new Date();
  midDate.setDate(midDate.getDate() - Math.floor(daysWindow / 2));
  const midStr = midDate.toISOString().split('T')[0];

  const recentSales = prodSales.filter(s => s.date >= midStr).reduce((a, b) => a + (Number(b.quantitySold) || 0), 0);
  const olderSales = prodSales.filter(s => s.date < midStr).reduce((a, b) => a + (Number(b.quantitySold) || 0), 0);

  let demandTrend: DemandTrend = 'Stable';
  if (recentSales > olderSales * 1.15) {
    demandTrend = 'Increasing';
  } else if (recentSales < olderSales * 0.85) {
    demandTrend = 'Decreasing';
  }

  // Sales Velocity Classification
  let salesVelocity: 'Fast' | 'Moderate' | 'Slow' = 'Moderate';
  if (avgDailySales >= 10) {
    salesVelocity = 'Fast';
  } else if (avgDailySales < 2) {
    salesVelocity = 'Slow';
  }

  // Risk Calculations
  let stockoutRisk: RiskLevel = 'None';
  if (daysOfInventoryRemaining <= product.leadTime) {
    stockoutRisk = 'High';
  } else if (daysOfInventoryRemaining <= product.leadTime * 2) {
    stockoutRisk = 'Medium';
  } else if (daysOfInventoryRemaining <= product.leadTime * 3) {
    stockoutRisk = 'Low';
  }

  let overstockRisk: RiskLevel = 'None';
  if (daysOfInventoryRemaining > 90 && salesVelocity === 'Slow') {
    overstockRisk = 'High';
  } else if (daysOfInventoryRemaining > 60) {
    overstockRisk = 'Medium';
  } else if (daysOfInventoryRemaining > 45) {
    overstockRisk = 'Low';
  }

  // Dynamic Status Classification
  let status: StockStatus = 'Healthy';
  if (product.currentStock <= Math.ceil(avgDailySales * product.leadTime) || product.currentStock === 0) {
    status = 'Critical';
  } else if (product.currentStock <= reorderPoint) {
    status = 'Reorder Soon';
  } else if (overstockRisk === 'High' || daysOfInventoryRemaining > 75) {
    status = 'Overstocked';
  } else if (daysOfInventoryRemaining <= product.leadTime * 2.5) {
    status = 'Monitor';
  }

  return {
    productId: product.id,
    productName: product.name,
    category: product.category,
    sku: product.sku,
    unitPrice: product.unitPrice,
    currentStock: product.currentStock,
    reorderLevel: product.reorderLevel,
    leadTime: product.leadTime,
    minOrderQty: product.minOrderQty,
    inventoryValue,
    totalUnitsSold,
    totalRevenue,
    avgDailySales,
    avgWeeklySales,
    daysOfInventoryRemaining: daysOfInventoryRemaining === 999 ? 999 : daysOfInventoryRemaining,
    safetyStock,
    reorderPoint,
    stockoutRisk,
    overstockRisk,
    demandTrend,
    salesVelocity,
    status
  };
}

export function generateStockAlerts(metrics: ProductMetrics[]): StockAlert[] {
  const alerts: StockAlert[] = [];

  metrics.forEach(m => {
    if (m.status === 'Critical') {
      const estDays = m.daysOfInventoryRemaining === 999 ? 0 : m.daysOfInventoryRemaining;
      alerts.push({
        id: `ALT-CRIT-${m.productId}`,
        productId: m.productId,
        productName: m.productName,
        category: m.category,
        type: 'critical',
        severity: 'high',
        currentStock: m.currentStock,
        avgDailySales: m.avgDailySales,
        estimatedStockoutDays: Math.max(0, Math.round(estDays)),
        actionText: 'Reorder Immediately',
        reason: m.currentStock === 0 
          ? 'Product is completely OUT OF STOCK.' 
          : `Stock will deplete within ${Math.max(1, Math.round(estDays))} day(s) based on average daily sales (${m.avgDailySales} units/day).`
      });
    } else if (m.status === 'Reorder Soon') {
      const estDays = m.daysOfInventoryRemaining === 999 ? 14 : m.daysOfInventoryRemaining;
      alerts.push({
        id: `ALT-REORD-${m.productId}`,
        productId: m.productId,
        productName: m.productName,
        category: m.category,
        type: 'reorder_soon',
        severity: 'medium',
        currentStock: m.currentStock,
        avgDailySales: m.avgDailySales,
        estimatedStockoutDays: Math.round(estDays),
        actionText: 'Prepare Purchase Order',
        reason: `Current stock (${m.currentStock}) is below the calculated reorder point (${m.reorderPoint} units).`
      });
    } else if (m.status === 'Overstocked') {
      alerts.push({
        id: `ALT-OVER-${m.productId}`,
        productId: m.productId,
        productName: m.productName,
        category: m.category,
        type: 'overstocked',
        severity: 'low',
        currentStock: m.currentStock,
        avgDailySales: m.avgDailySales,
        estimatedStockoutDays: null,
        actionText: 'Pause Reordering & Consider Promotions',
        reason: `Excess stock estimated to last ${m.daysOfInventoryRemaining > 300 ? '300+' : Math.round(m.daysOfInventoryRemaining)} days at current sales velocity (${m.avgDailySales} units/day).`
      });
    } else if (m.salesVelocity === 'Slow' && m.currentStock > m.reorderLevel * 2) {
      alerts.push({
        id: `ALT-SLOW-${m.productId}`,
        productId: m.productId,
        productName: m.productName,
        category: m.category,
        type: 'slow_moving',
        severity: 'low',
        currentStock: m.currentStock,
        avgDailySales: m.avgDailySales,
        estimatedStockoutDays: null,
        actionText: 'Review Pricing or Discount',
        reason: `Sales velocity is slow (${m.avgDailySales} units/day) with high holding cost relative to sales.`
      });
    }
  });

  // Sort by severity (high > medium > low)
  const severityMap = { high: 1, medium: 2, low: 3 };
  return alerts.sort((a, b) => severityMap[a.severity] - severityMap[b.severity]);
}

export function generateRecommendations(
  metrics: ProductMetrics[],
  forecastHorizonDays: number = 14
): InventoryRecommendation[] {
  const recommendations: InventoryRecommendation[] = [];

  metrics.forEach(m => {
    // Estimate predicted demand over horizon
    const predictedDemand = Math.round(m.avgDailySales * forecastHorizonDays);

    if (m.status === 'Critical' || m.status === 'Reorder Soon') {
      // Recommended Order = Predicted Demand + Safety Stock - Current Stock
      const rawOrder = predictedDemand + m.safetyStock - m.currentStock;
      const recommendedQty = Math.max(m.minOrderQty, Math.ceil(rawOrder / m.minOrderQty) * m.minOrderQty);

      recommendations.push({
        id: `REC-REORDER-${m.productId}`,
        productId: m.productId,
        productName: m.productName,
        category: m.category,
        type: 'REORDER',
        currentStock: m.currentStock,
        predictedDemand,
        recommendedQty,
        priority: m.status === 'Critical' ? 'HIGH' : 'MEDIUM',
        reason: `Predicted ${forecastHorizonDays}-day demand (${predictedDemand} units) + safety stock (${m.safetyStock} units) exceeds current available stock (${m.currentStock} units).`
      });
    } else if (m.status === 'Overstocked') {
      recommendations.push({
        id: `REC-REDUCE-${m.productId}`,
        productId: m.productId,
        productName: m.productName,
        category: m.category,
        type: 'REDUCE_PURCHASE',
        currentStock: m.currentStock,
        predictedDemand,
        recommendedQty: 0,
        priority: 'MEDIUM',
        reason: `Low sales velocity (${m.avgDailySales} units/day) with ${Math.round(m.daysOfInventoryRemaining)} days of inventory remaining. Avoid additional purchase orders.`
      });
    } else if (m.status === 'Monitor') {
      recommendations.push({
        id: `REC-MONITOR-${m.productId}`,
        productId: m.productId,
        productName: m.productName,
        category: m.category,
        type: 'MONITOR',
        currentStock: m.currentStock,
        predictedDemand,
        recommendedQty: 0,
        priority: 'LOW',
        reason: `Demand is stable (${m.avgDailySales} units/day) but stock level is approaching reorder threshold. Keep monitoring daily sales.`
      });
    }
  });

  const priorityMap = { HIGH: 1, MEDIUM: 2, LOW: 3 };
  return recommendations.sort((a, b) => priorityMap[a.priority] - priorityMap[b.priority]);
}
