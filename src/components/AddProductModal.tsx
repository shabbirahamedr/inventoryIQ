import React, { useState } from 'react';
import { X, PlusCircle, AlertCircle } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose }) => {
  const { addProduct, settings } = useInventory();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Groceries',
    supplier: '',
    unitPrice: '',
    currentStock: '',
    reorderLevel: '20',
    leadTime: '5',
    minOrderQty: '25'
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const categories = ['Groceries', 'Beverages', 'Electronics', 'Stationery', 'Personal Care', 'Household'];

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!formData.name.trim()) errs.name = 'Product name is required';
    if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) errs.unitPrice = 'Enter a valid unit price > 0';
    if (formData.currentStock === '' || parseInt(formData.currentStock, 10) < 0) errs.currentStock = 'Current stock must be 0 or higher';
    if (!formData.reorderLevel || parseInt(formData.reorderLevel, 10) < 0) errs.reorderLevel = 'Enter a valid reorder level';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const skuCode = formData.sku.trim() || `SKU-${Date.now().toString().slice(-6)}`;

    addProduct({
      name: formData.name.trim(),
      sku: skuCode,
      category: formData.category,
      supplier: formData.supplier.trim() || 'General Supplier',
      unitPrice: parseFloat(formData.unitPrice),
      currentStock: parseInt(formData.currentStock, 10),
      reorderLevel: parseInt(formData.reorderLevel, 10),
      leadTime: parseInt(formData.leadTime, 10) || 5,
      minOrderQty: parseInt(formData.minOrderQty, 10) || 25
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Add New Inventory Product</h2>
              <p className="text-xs text-slate-500">Fill in product specs and stock thresholds</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
            <input
              type="text"
              placeholder="e.g. Organic Almond Milk 1L"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 outline-none ${
                errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {errors.name && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 text-slate-900 outline-none"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SKU Code (Optional)</label>
              <input
                type="text"
                placeholder="e.g. BEV-MLK-001"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Price ({settings.currencySymbol}) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="240"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 text-slate-900 outline-none ${
                  errors.unitPrice ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {errors.unitPrice && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.unitPrice}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Stock Quantity *</label>
              <input
                type="number"
                placeholder="100"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 text-slate-900 outline-none ${
                  errors.currentStock ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {errors.currentStock && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.currentStock}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reorder Level</label>
              <input
                type="number"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Time (Days)</label>
              <input
                type="number"
                value={formData.leadTime}
                onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Min Order Qty</label>
              <input
                type="number"
                value={formData.minOrderQty}
                onChange={(e) => setFormData({ ...formData, minOrderQty: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 text-slate-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Apex Wholesale Supplies"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 text-slate-900 outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs">
              Save Product
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
