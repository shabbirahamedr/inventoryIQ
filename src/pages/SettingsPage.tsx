import React, { useState } from 'react';
import { 
  Settings, 
  Store, 
  DollarSign, 
  Sliders, 
  RotateCcw, 
  Trash2, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Bell
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetToDemoData, clearAllData } = useInventory();

  const [form, setForm] = useState({
    businessName: settings.businessName,
    currencySymbol: settings.currencySymbol,
    currencyCode: settings.currencyCode,
    defaultReorderThreshold: settings.defaultReorderThreshold,
    safetyStockPercent: settings.safetyStockPercent,
    forecastPeriodDays: settings.forecastPeriodDays,
    notificationsEnabled: settings.notificationsEnabled
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      businessName: form.businessName,
      currencySymbol: form.currencySymbol,
      currencyCode: form.currencyCode,
      defaultReorderThreshold: Number(form.defaultReorderThreshold),
      safetyStockPercent: Number(form.safetyStockPercent),
      forecastPeriodDays: Number(form.forecastPeriodDays),
      notificationsEnabled: form.notificationsEnabled
    });
    showToast('Preferences saved successfully!');
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset inventory and sales database back to initial rich demo dataset?')) {
      resetToDemoData();
      showToast('Demo data reloaded successfully!');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all products and sales records? This cannot be undone.')) {
      clearAllData();
      showToast('All custom data cleared.');
    }
  };

  const currencies = [
    { code: 'INR', symbol: '₹', label: 'INR (₹) - Indian Rupee' },
    { code: 'USD', symbol: '$', label: 'USD ($) - US Dollar' },
    { code: 'EUR', symbol: '€', label: 'EUR (€) - Euro' },
    { code: 'GBP', symbol: '£', label: 'GBP (£) - British Pound' }
  ];

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">System & Business Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure currency, inventory forecasting thresholds, and database management.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Profile */}
        <div className="neu-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Store className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Business Identity</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Store / Business Name</label>
              <input
                type="text"
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. SuperRetail Stores"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Setting</label>
              <select
                value={form.currencyCode}
                onChange={(e) => {
                  const sel = currencies.find(c => c.code === e.target.value);
                  setForm({
                    ...form,
                    currencyCode: e.target.value,
                    currencySymbol: sel ? sel.symbol : '$'
                  });
                }}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Engine Parameters */}
        <div className="neu-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Inventory & Algorithm Parameters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default Reorder Point (Units)</label>
              <input
                type="number"
                min="1"
                max="500"
                value={form.defaultReorderThreshold}
                onChange={(e) => setForm({ ...form, defaultReorderThreshold: Number(e.target.value) })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Baseline threshold for low stock</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Safety Stock Buffer (%)</label>
              <input
                type="number"
                min="5"
                max="100"
                value={form.safetyStockPercent}
                onChange={(e) => setForm({ ...form, safetyStockPercent: Number(e.target.value) })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Buffer against demand spikes</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Forecast Horizon (Days)</label>
              <input
                type="number"
                min="7"
                max="60"
                value={form.forecastPeriodDays}
                onChange={(e) => setForm({ ...form, forecastPeriodDays: Number(e.target.value) })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Lookahead days for predictions</span>
            </div>
          </div>
        </div>

        {/* Notifications & Toggles */}
        <div className="neu-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Alerts & System Preferences</h3>
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-slate-800">Critical Stockout Notifications</p>
              <p className="text-[11px] text-slate-500">Enable in-app notification badges when items breach threshold.</p>
            </div>
            <input
              type="checkbox"
              checked={form.notificationsEnabled}
              onChange={(e) => setForm({ ...form, notificationsEnabled: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
          </label>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end">
          <button type="submit" className="btn-primary py-2.5 px-6 text-xs shadow-md">
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Data Management Section */}
      <div className="neu-card p-6 space-y-4 border border-rose-100 bg-rose-50/20">
        <div className="flex items-center gap-2 border-b border-rose-100 pb-3">
          <Database className="w-4 h-4 text-rose-600" />
          <h3 className="font-bold text-slate-900 text-sm">Data & Storage Management</h3>
        </div>

        <p className="text-xs text-slate-600">
          All data is cached locally in your browser storage. You can reload the sample enterprise dataset or wipe all records.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleResetDemo}
            className="btn-secondary py-2 px-3 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
            <span>Reload Demo Dataset</span>
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors inline-flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
