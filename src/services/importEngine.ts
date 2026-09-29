import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Product, SalesRecord, ImportValidationResult } from '../types/inventory';

// Normalize header text for flexible fuzzy matching
function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

export async function parseAndValidateImportFile(file: File): Promise<ImportValidationResult> {
  const fileName = file.name;
  const fileSize = file.size;

  let rawRows: any[] = [];

  // 1. Read File depending on type
  if (fileName.endsWith('.csv')) {
    rawRows = await new Promise<any[]>((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (err) => reject(err)
      });
    });
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  } else {
    throw new Error('Unsupported file format. Please upload a .csv, .xlsx, or .xls file.');
  }

  if (!rawRows || rawRows.length === 0) {
    throw new Error('The uploaded file contains no data rows.');
  }

  // 2. Identify Column Headers
  const rawHeaders = Object.keys(rawRows[0] || {});
  const normalizedMap: { [normalized: string]: string } = {};
  rawHeaders.forEach(h => {
    normalizedMap[normalizeHeader(h)] = h;
  });

  // Target schema aliases
  const aliases = {
    productName: ['productname', 'product', 'item', 'itemname', 'title', 'name'],
    sku: ['sku', 'code', 'productcode', 'itemcode', 'id'],
    category: ['category', 'group', 'type', 'department'],
    price: ['price', 'unitprice', 'cost', 'rate'],
    stock: ['stock', 'currentstock', 'quantity', 'qty', 'inventory'],
    salesQty: ['quantitysold', 'sold', 'unitsold', 'sales', 'qtysold'],
    date: ['date', 'salesdate', 'timestamp', 'createdat'],
    reorderLevel: ['reorderlevel', 'reorderpoint', 'minstock']
  };

  const findHeader = (aliasList: string[]): string | null => {
    for (const alias of aliasList) {
      if (normalizedMap[alias]) return normalizedMap[alias];
    }
    return null;
  };

  const nameCol = findHeader(aliases.productName);
  const skuCol = findHeader(aliases.sku);
  const catCol = findHeader(aliases.category);
  const priceCol = findHeader(aliases.price);
  const stockCol = findHeader(aliases.stock);
  const salesQtyCol = findHeader(aliases.salesQty);
  const dateCol = findHeader(aliases.date);
  const reorderCol = findHeader(aliases.reorderLevel);

  const missingColumns: string[] = [];
  if (!nameCol) missingColumns.push('Product Name');
  if (!priceCol) missingColumns.push('Price/Unit Price');

  const requiredColumnsFound = missingColumns.length === 0;

  // 3. Inspect Data Rows & Find Missing/Invalid Values
  let missingValuesCount = 0;
  let invalidValuesCount = 0;
  const parsedProductsMap: { [id: string]: Product } = {};
  const parsedSales: SalesRecord[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  rawRows.forEach((row, idx) => {
    const rawName = nameCol ? String(row[nameCol] || '').trim() : '';
    const rawPrice = priceCol ? parseFloat(row[priceCol]) : 0;
    const rawStock = stockCol ? parseInt(row[stockCol], 10) : 0;
    const rawCategory = catCol ? String(row[catCol] || '').trim() : 'General';
    const rawSku = skuCol ? String(row[skuCol] || '').trim() : `SKU-${1000 + idx}`;
    const rawSalesQty = salesQtyCol ? parseInt(row[salesQtyCol], 10) : 0;
    const rawDate = dateCol ? String(row[dateCol] || '').trim() : todayStr;
    const rawReorder = reorderCol ? parseInt(row[reorderCol], 10) : 20;

    if (!rawName) missingValuesCount++;
    if (isNaN(rawPrice) || rawPrice < 0) invalidValuesCount++;
    if (isNaN(rawStock)) missingValuesCount++;

    if (rawName) {
      const prodId = `IMP-PROD-${idx + 1}`;
      if (!parsedProductsMap[rawName]) {
        parsedProductsMap[rawName] = {
          id: prodId,
          name: rawName,
          sku: rawSku || `SKU-${1000 + idx}`,
          category: rawCategory || 'General',
          supplier: 'Imported Supplier',
          unitPrice: isNaN(rawPrice) ? 100 : rawPrice,
          currentStock: isNaN(rawStock) ? 0 : rawStock,
          reorderLevel: isNaN(rawReorder) ? 20 : rawReorder,
          leadTime: 5,
          minOrderQty: 25,
          status: 'Healthy',
          lastUpdated: todayStr
        };
      }

      if (rawSalesQty > 0) {
        parsedSales.push({
          id: `IMP-SALE-${idx + 1}`,
          productId: parsedProductsMap[rawName].id,
          productName: rawName,
          category: rawCategory,
          quantitySold: rawSalesQty,
          unitPrice: isNaN(rawPrice) ? 100 : rawPrice,
          revenue: rawSalesQty * (isNaN(rawPrice) ? 100 : rawPrice),
          date: rawDate || todayStr
        });
      }
    }
  });

  return {
    fileName,
    fileSize,
    totalRows: rawRows.length,
    detectedColumns: rawHeaders,
    requiredColumnsFound,
    missingColumns,
    missingValuesCount,
    invalidValuesCount,
    previewData: rawRows.slice(0, 10),
    parsedProducts: Object.values(parsedProductsMap),
    parsedSales
  };
}
