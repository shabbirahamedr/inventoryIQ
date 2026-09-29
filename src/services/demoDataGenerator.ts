import { Product, SalesRecord } from '../types/inventory';

export interface DemoDataset {
  products: Product[];
  sales: SalesRecord[];
}

export function generateDemoData(): DemoDataset {
  const categories = ['Groceries', 'Beverages', 'Electronics', 'Stationery', 'Personal Care', 'Household'];
  const now = new Date();
  
  // 60 Realistic Products
  const rawProducts = [
    // Groceries
    { name: 'Fresh Apples (Organic Red)', sku: 'GRO-APP-001', category: 'Groceries', unitPrice: 150, currentStock: 145, reorderLevel: 50, leadTime: 3, minOrderQty: 100, targetDailySales: 28 },
    { name: 'Basmati Rice (5kg Bag)', sku: 'GRO-RIC-002', category: 'Groceries', unitPrice: 600, currentStock: 32, reorderLevel: 45, leadTime: 5, minOrderQty: 50, targetDailySales: 8 },
    { name: 'Whole Wheat Flour (10kg)', sku: 'GRO-FLO-003', category: 'Groceries', unitPrice: 420, currentStock: 18, reorderLevel: 25, leadTime: 4, minOrderQty: 30, targetDailySales: 6 },
    { name: 'Pure Olive Oil (1L)', sku: 'GRO-OIL-004', category: 'Groceries', unitPrice: 850, currentStock: 80, reorderLevel: 20, leadTime: 7, minOrderQty: 25, targetDailySales: 3 },
    { name: 'Organic Honey (500g)', sku: 'GRO-HNY-005', category: 'Groceries', unitPrice: 380, currentStock: 8, reorderLevel: 15, leadTime: 5, minOrderQty: 20, targetDailySales: 4 }, // Critical!
    { name: 'Rolled Oats (1kg)', sku: 'GRO-OAT-006', category: 'Groceries', unitPrice: 220, currentStock: 110, reorderLevel: 30, leadTime: 4, minOrderQty: 40, targetDailySales: 7 },
    { name: 'Almonds (500g Pack)', sku: 'GRO-ALM-007', category: 'Groceries', unitPrice: 550, currentStock: 42, reorderLevel: 20, leadTime: 6, minOrderQty: 30, targetDailySales: 5 },
    { name: 'Peanut Butter (350g)', sku: 'GRO-PBT-008', category: 'Groceries', unitPrice: 210, currentStock: 65, reorderLevel: 25, leadTime: 3, minOrderQty: 40, targetDailySales: 4 },
    { name: 'Dark Chocolate Bar (100g)', sku: 'GRO-CHO-009', category: 'Groceries', unitPrice: 120, currentStock: 340, reorderLevel: 40, leadTime: 4, minOrderQty: 50, targetDailySales: 3 }, // Overstocked!
    { name: 'Refined Sugar (5kg)', sku: 'GRO-SUG-010', category: 'Groceries', unitPrice: 260, currentStock: 95, reorderLevel: 35, leadTime: 3, minOrderQty: 50, targetDailySales: 12 },

    // Beverages
    { name: 'Cold Brew Coffee (250ml)', sku: 'BEV-COF-001', category: 'Beverages', unitPrice: 180, currentStock: 220, reorderLevel: 60, leadTime: 2, minOrderQty: 100, targetDailySales: 35 },
    { name: 'Green Tea Bags (100 Pack)', sku: 'BEV-TEA-002', category: 'Beverages', unitPrice: 320, currentStock: 35, reorderLevel: 40, leadTime: 4, minOrderQty: 50, targetDailySales: 9 }, // Reorder Soon
    { name: 'Almond Milk (1L)', sku: 'BEV-MLK-003', category: 'Beverages', unitPrice: 240, currentStock: 12, reorderLevel: 30, leadTime: 3, minOrderQty: 60, targetDailySales: 11 }, // Critical!
    { name: 'Sparkling Water (500ml Pack of 6)', sku: 'BEV-WAT-004', category: 'Beverages', unitPrice: 290, currentStock: 180, reorderLevel: 50, leadTime: 3, minOrderQty: 80, targetDailySales: 18 },
    { name: 'Orange Juice Concentrate (1L)', sku: 'BEV-JUC-005', category: 'Beverages', unitPrice: 160, currentStock: 450, reorderLevel: 50, leadTime: 5, minOrderQty: 100, targetDailySales: 2 }, // Overstocked / Slow
    { name: 'Energy Drink Cans (250ml Pack of 4)', sku: 'BEV-ENG-006', category: 'Beverages', unitPrice: 400, currentStock: 90, reorderLevel: 30, leadTime: 2, minOrderQty: 40, targetDailySales: 14 },
    { name: 'Coconut Water (500ml)', sku: 'BEV-CCN-007', category: 'Beverages', unitPrice: 90, currentStock: 130, reorderLevel: 40, leadTime: 3, minOrderQty: 60, targetDailySales: 22 },
    { name: 'Herbal Infusion Tea (50g)', sku: 'BEV-HRB-008', category: 'Beverages', unitPrice: 280, currentStock: 75, reorderLevel: 20, leadTime: 5, minOrderQty: 30, targetDailySales: 3 },
    { name: 'Mango Smoothie Mix (1L)', sku: 'BEV-SMO-009', category: 'Beverages', unitPrice: 210, currentStock: 25, reorderLevel: 25, leadTime: 4, minOrderQty: 40, targetDailySales: 6 },
    { name: 'Espresso Beans Roast (1kg)', sku: 'BEV-ESP-010', category: 'Beverages', unitPrice: 990, currentStock: 40, reorderLevel: 15, leadTime: 7, minOrderQty: 20, targetDailySales: 4 },

    // Electronics
    { name: 'Bluetooth Wireless Speaker', sku: 'ELE-SPK-001', category: 'Electronics', unitPrice: 1500, currentStock: 240, reorderLevel: 30, leadTime: 10, minOrderQty: 25, targetDailySales: 1.2 }, // Overstocked
    { name: 'Type-C Fast Charger (65W)', sku: 'ELE-CHG-002', category: 'Electronics', unitPrice: 890, currentStock: 165, reorderLevel: 40, leadTime: 5, minOrderQty: 50, targetDailySales: 14 },
    { name: 'Ergonomic Wireless Mouse', sku: 'ELE-MSE-003', category: 'Electronics', unitPrice: 1200, currentStock: 15, reorderLevel: 25, leadTime: 7, minOrderQty: 20, targetDailySales: 4.5 }, // Critical
    { name: 'HD Webcam 1080p', sku: 'ELE-CAM-004', category: 'Electronics', unitPrice: 2800, currentStock: 45, reorderLevel: 15, leadTime: 10, minOrderQty: 10, targetDailySales: 2 },
    { name: 'Noise Cancelling Earbuds', sku: 'ELE-EAR-005', category: 'Electronics', unitPrice: 3400, currentStock: 28, reorderLevel: 20, leadTime: 8, minOrderQty: 15, targetDailySales: 3.8 }, // Reorder Soon
    { name: 'USB-C Multiport Hub', sku: 'ELE-HUB-006', category: 'Electronics', unitPrice: 1850, currentStock: 55, reorderLevel: 20, leadTime: 7, minOrderQty: 20, targetDailySales: 3.2 },
    { name: 'Power Bank 20,000mAh', sku: 'ELE-PWR-007', category: 'Electronics', unitPrice: 1950, currentStock: 82, reorderLevel: 25, leadTime: 6, minOrderQty: 30, targetDailySales: 5.5 },
    { name: 'Smart Fitness Band v4', sku: 'ELE-BND-008', category: 'Electronics', unitPrice: 2490, currentStock: 190, reorderLevel: 25, leadTime: 12, minOrderQty: 20, targetDailySales: 0.8 }, // Overstocked
    { name: 'HDMI 2.1 Braided Cable (2m)', sku: 'ELE-CBL-009', category: 'Electronics', unitPrice: 450, currentStock: 120, reorderLevel: 30, leadTime: 4, minOrderQty: 50, targetDailySales: 8.5 },
    { name: 'Desktop LED Ring Light', sku: 'ELE-LGT-010', category: 'Electronics', unitPrice: 1100, currentStock: 6, reorderLevel: 15, leadTime: 6, minOrderQty: 15, targetDailySales: 2.2 }, // Critical

    // Stationery
    { name: 'A4 Printing Paper (500 Sheets)', sku: 'STA-PAP-001', category: 'Stationery', unitPrice: 340, currentStock: 410, reorderLevel: 100, leadTime: 3, minOrderQty: 100, targetDailySales: 32 },
    { name: 'Gel Ink Pens (Box of 12)', sku: 'STA-PEN-002', category: 'Stationery', unitPrice: 180, currentStock: 95, reorderLevel: 80, leadTime: 4, minOrderQty: 100, targetDailySales: 16 }, // Monitor
    { name: 'Spiral Leather Notebook', sku: 'STA-NTB-003', category: 'Stationery', unitPrice: 290, currentStock: 22, reorderLevel: 35, leadTime: 5, minOrderQty: 50, targetDailySales: 7.2 }, // Reorder Soon
    { name: 'Sticky Notes Pastel (4 Packs)', sku: 'STA-STK-004', category: 'Stationery', unitPrice: 140, currentStock: 320, reorderLevel: 50, leadTime: 3, minOrderQty: 60, targetDailySales: 15 },
    { name: 'Highlighter Set (6 Colors)', sku: 'STA-HLT-005', category: 'Stationery', unitPrice: 210, currentStock: 140, reorderLevel: 40, leadTime: 4, minOrderQty: 50, targetDailySales: 9 },
    { name: 'Heavy Duty Stapler & Pins', sku: 'STA-STP-006', category: 'Stationery', unitPrice: 480, currentStock: 18, reorderLevel: 20, leadTime: 5, minOrderQty: 25, targetDailySales: 2.8 }, // Monitor
    { name: 'Document File Organizer', sku: 'STA-ORG-007', category: 'Stationery', unitPrice: 380, currentStock: 280, reorderLevel: 30, leadTime: 6, minOrderQty: 40, targetDailySales: 1.5 }, // Overstocked
    { name: 'Permanent Marker Dual-Tip', sku: 'STA-MRK-008', category: 'Stationery', unitPrice: 95, currentStock: 185, reorderLevel: 50, leadTime: 3, minOrderQty: 100, targetDailySales: 14 },
    { name: 'Correction Tape Pack of 3', sku: 'STA-TAP-009', category: 'Stationery', unitPrice: 160, currentStock: 78, reorderLevel: 30, leadTime: 4, minOrderQty: 50, targetDailySales: 5 },
    { name: 'Stainless Scissors (8 inch)', sku: 'STA-SCS-010', category: 'Stationery', unitPrice: 220, currentStock: 9, reorderLevel: 15, leadTime: 5, minOrderQty: 20, targetDailySales: 3 }, // Critical

    // Personal Care
    { name: 'Hydrating Face Moisturizer (100ml)', sku: 'PER-MST-001', category: 'Personal Care', unitPrice: 650, currentStock: 140, reorderLevel: 35, leadTime: 5, minOrderQty: 40, targetDailySales: 12 },
    { name: 'Organic Charcoal Toothpaste', sku: 'PER-TPP-002', category: 'Personal Care', unitPrice: 190, currentStock: 26, reorderLevel: 40, leadTime: 4, minOrderQty: 50, targetDailySales: 9.5 }, // Reorder Soon
    { name: 'Sulfate-Free Shampoo (350ml)', sku: 'PER-SHM-003', category: 'Personal Care', unitPrice: 480, currentStock: 85, reorderLevel: 30, leadTime: 5, minOrderQty: 40, targetDailySales: 7.8 },
    { name: 'Sunscreen Lotion SPF 50+', sku: 'PER-SUN-004', category: 'Personal Care', unitPrice: 590, currentStock: 210, reorderLevel: 45, leadTime: 4, minOrderQty: 50, targetDailySales: 18.5 },
    { name: 'Essential Tea Tree Hand Wash', sku: 'PER-HND-005', category: 'Personal Care', unitPrice: 160, currentStock: 390, reorderLevel: 60, leadTime: 3, minOrderQty: 80, targetDailySales: 4 }, // Overstocked
    { name: 'Bamboo Toothbrush (Pack of 4)', sku: 'PER-TBS-006', category: 'Personal Care', unitPrice: 240, currentStock: 7, reorderLevel: 25, leadTime: 4, minOrderQty: 50, targetDailySales: 6.5 }, // Critical
    { name: 'Moisturizing Body Wash (500ml)', sku: 'PER-BDY-007', category: 'Personal Care', unitPrice: 420, currentStock: 115, reorderLevel: 35, leadTime: 4, minOrderQty: 40, targetDailySales: 10 },
    { name: 'Vitamin C Serum (30ml)', sku: 'PER-SRM-008', category: 'Personal Care', unitPrice: 950, currentStock: 48, reorderLevel: 20, leadTime: 6, minOrderQty: 25, targetDailySales: 5.2 },
    { name: 'Deodorant Roll-On (50ml)', sku: 'PER-DEO-009', category: 'Personal Care', unitPrice: 220, currentStock: 160, reorderLevel: 40, leadTime: 3, minOrderQty: 60, targetDailySales: 11 },
    { name: 'Microfiber Hair Towel', sku: 'PER-TWL-010', category: 'Personal Care', unitPrice: 350, currentStock: 230, reorderLevel: 25, leadTime: 7, minOrderQty: 30, targetDailySales: 1.1 }, // Overstocked

    // Household
    { name: 'Dishwashing Liquid Lemon (1L)', sku: 'HOU-DSH-001', category: 'Household', unitPrice: 185, currentStock: 320, reorderLevel: 70, leadTime: 3, minOrderQty: 80, targetDailySales: 26 },
    { name: 'Microfiber Cleaning Cloths (5 Pack)', sku: 'HOU-CLT-002', category: 'Household', unitPrice: 290, currentStock: 48, reorderLevel: 50, leadTime: 4, minOrderQty: 50, targetDailySales: 13.5 }, // Reorder Soon
    { name: 'Laundry Detergent Pods (30 Pack)', sku: 'HOU-DET-003', category: 'Household', unitPrice: 750, currentStock: 92, reorderLevel: 30, leadTime: 5, minOrderQty: 30, targetDailySales: 8 },
    { name: 'Trash Bags Heavy Duty (30 Rolls)', sku: 'HOU-TRH-004', category: 'Household', unitPrice: 210, currentStock: 510, reorderLevel: 80, leadTime: 3, minOrderQty: 100, targetDailySales: 29 },
    { name: 'Surface Disinfectant Spray (500ml)', sku: 'HOU-SPR-005', category: 'Household', unitPrice: 260, currentStock: 11, reorderLevel: 35, leadTime: 3, minOrderQty: 60, targetDailySales: 12 }, // Critical
    { name: 'Air Freshener Lavender (300ml)', sku: 'HOU-AIR-006', category: 'Household', unitPrice: 240, currentStock: 290, reorderLevel: 40, leadTime: 4, minOrderQty: 50, targetDailySales: 3.5 }, // Overstocked
    { name: 'Kitchen Sponge Scrubbers (6 Pack)', sku: 'HOU-SPN-007', category: 'Household', unitPrice: 130, currentStock: 175, reorderLevel: 60, leadTime: 3, minOrderQty: 80, targetDailySales: 19 },
    { name: 'Aluminum Foil Roll (25 meters)', sku: 'HOU-FOL-008', category: 'Household', unitPrice: 310, currentStock: 84, reorderLevel: 30, leadTime: 4, minOrderQty: 40, targetDailySales: 7.2 },
    { name: 'Floor Cleaner Concentrate (1L)', sku: 'HOU-FLR-009', category: 'Household', unitPrice: 270, currentStock: 140, reorderLevel: 40, leadTime: 4, minOrderQty: 50, targetDailySales: 10 },
    { name: 'Stainless Steel Water Bottle (1L)', sku: 'HOU-BTL-010', category: 'Household', unitPrice: 580, currentStock: 62, reorderLevel: 25, leadTime: 6, minOrderQty: 30, targetDailySales: 4.8 }
  ];

  const products: Product[] = rawProducts.map((p, idx) => {
    // derive realistic status for initialization
    let status: Product['status'] = 'Healthy';
    const estDays = p.currentStock / (p.targetDailySales || 1);
    if (p.currentStock <= p.leadTime * p.targetDailySales) {
      status = 'Critical';
    } else if (p.currentStock <= p.reorderLevel) {
      status = 'Reorder Soon';
    } else if (estDays > 60 && p.targetDailySales < 5) {
      status = 'Overstocked';
    } else if (estDays < 15) {
      status = 'Monitor';
    }

    return {
      id: `PROD-${1000 + idx}`,
      name: p.name,
      sku: p.sku,
      category: p.category,
      supplier: `Apex Wholesale ${p.category}`,
      unitPrice: p.unitPrice,
      currentStock: p.currentStock,
      reorderLevel: p.reorderLevel,
      leadTime: p.leadTime,
      minOrderQty: p.minOrderQty,
      status,
      lastUpdated: now.toISOString().split('T')[0]
    };
  });

  // Generate 90 days of daily sales records with realistic seasonal/weekly patterns
  const sales: SalesRecord[] = [];
  const daysToGenerate = 90;

  for (let i = daysToGenerate; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    rawProducts.forEach((p, idx) => {
      const prodId = `PROD-${1000 + idx}`;
      // Weekend multiplier (e.g. 1.25x for groceries/beverages/household on weekends)
      const dayMult = isWeekend ? 1.25 : 0.95;
      // Slight trend fluctuation (-20% to +30%)
      const randomVar = 0.8 + Math.random() * 0.5;
      const daySales = Math.max(0, Math.round(p.targetDailySales * dayMult * randomVar));

      if (daySales > 0) {
        sales.push({
          id: `SALE-${dateStr}-${prodId}`,
          productId: prodId,
          productName: p.name,
          category: p.category,
          quantitySold: daySales,
          unitPrice: p.unitPrice,
          revenue: daySales * p.unitPrice,
          date: dateStr
        });
      }
    });
  }

  return { products, sales };
}
