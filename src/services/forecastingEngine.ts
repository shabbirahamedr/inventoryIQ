import { Product, SalesRecord, ForecastResult, DailyForecastPoint, DemandTrend } from '../types/inventory';

export function forecastProductDemand(
  product: Product,
  sales: SalesRecord[],
  horizonDays: number = 7,
  historyLookbackDays: number = 30
): ForecastResult {
  const now = new Date();
  
  // Group historical sales by date (YYYY-MM-DD)
  const historyMap: { [dateStr: string]: number } = {};
  
  // Pre-fill historyLookbackDays with 0
  for (let i = historyLookbackDays; i >= 1; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    historyMap[ds] = 0;
  }

  // Populate actual sales
  sales
    .filter(s => s.productId === product.id)
    .forEach(s => {
      if (historyMap[s.date] !== undefined) {
        historyMap[s.date] += Number(s.quantitySold) || 0;
      }
    });

  const sortedDates = Object.keys(historyMap).sort();
  const dailyHistoryValues = sortedDates.map(d => historyMap[d]);

  // Compute Exponential Moving Average (EMA) and trend slope
  const n = dailyHistoryValues.length;
  let ema = dailyHistoryValues[0] || 0;
  const alpha = 0.25; // Smoothing factor

  for (let i = 1; i < n; i++) {
    ema = alpha * dailyHistoryValues[i] + (1 - alpha) * ema;
  }

  // Calculate linear trend slope over recent 14 days
  const recent14 = dailyHistoryValues.slice(-14);
  const sumX = recent14.reduce((acc, _, i) => acc + i, 0);
  const sumY = recent14.reduce((acc, y) => acc + y, 0);
  const sumXY = recent14.reduce((acc, y, i) => acc + i * y, 0);
  const sumX2 = recent14.reduce((acc, _, i) => acc + i * i, 0);
  const len = recent14.length || 1;

  const slopeDenominator = len * sumX2 - sumX * sumX;
  const slope = slopeDenominator !== 0 ? (len * sumXY - sumX * sumY) / slopeDenominator : 0;

  // Determine Demand Trend
  let demandTrend: DemandTrend = 'Stable';
  if (slope > 0.15) {
    demandTrend = 'Increasing';
  } else if (slope < -0.15) {
    demandTrend = 'Decreasing';
  }

  // Calculate Variance & Confidence Indicator
  const mean = sumY / len;
  const variance = recent14.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / len;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? stdDev / mean : 0.5;

  // Confidence formula: higher for lower variance in sales history
  const confidenceLevel = Math.min(96, Math.max(75, Math.round(95 - cv * 25)));

  // Generate Predicted Daily Values with day-of-week seasonality (weekends boost)
  const chartData: DailyForecastPoint[] = [];

  // 1. Add historical points
  sortedDates.forEach(ds => {
    chartData.push({
      date: ds,
      historicalQuantity: historyMap[ds],
      predictedQuantity: null
    });
  });

  // Connect the last historical point to forecast line seamlessly
  const lastHistoricalDate = sortedDates[sortedDates.length - 1] || now.toISOString().split('T')[0];
  const lastVal = historyMap[lastHistoricalDate] || Math.round(ema);

  chartData.push({
    date: lastHistoricalDate,
    historicalQuantity: lastVal,
    predictedQuantity: lastVal
  });

  // 2. Add future predicted points
  let totalPredicted = 0;
  const baseDaily = Math.max(0.5, ema);

  for (let i = 1; i <= horizonDays; i++) {
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + i);
    const dateStr = futureDate.toISOString().split('T')[0];
    const isWeekend = futureDate.getDay() === 0 || futureDate.getDay() === 6;

    const weekendFactor = isWeekend ? 1.15 : 0.95;
    const trendEffect = slope * (i * 0.2); // Soft dampened trend projection
    const dayPrediction = Math.max(0, Math.round((baseDaily + trendEffect) * weekendFactor));

    totalPredicted += dayPrediction;

    chartData.push({
      date: dateStr,
      historicalQuantity: null,
      predictedQuantity: dayPrediction
    });
  }

  const avgDailyDemand = Number((totalPredicted / horizonDays).toFixed(1));

  // Estimate stockout day index
  let remainingStock = product.currentStock;
  let stockoutDays: number | null = null;

  for (let i = 1; i <= horizonDays; i++) {
    const futurePt = chartData.find(pt => {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      return pt.date === d.toISOString().split('T')[0];
    });
    if (futurePt && futurePt.predictedQuantity !== null) {
      remainingStock -= futurePt.predictedQuantity;
      if (remainingStock <= 0 && stockoutDays === null) {
        stockoutDays = i;
      }
    }
  }

  return {
    productId: product.id,
    productName: product.name,
    category: product.category,
    currentStock: product.currentStock,
    horizonDays,
    avgDailyDemand,
    predictedTotalDemand: totalPredicted,
    demandTrend,
    confidenceLevel,
    stockoutDays,
    chartData
  };
}
