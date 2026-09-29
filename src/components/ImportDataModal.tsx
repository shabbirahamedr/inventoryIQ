import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Loader2,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { parseAndValidateImportFile } from '../services/importEngine';
import { ImportValidationResult } from '../types/inventory';
import { useInventory } from '../context/InventoryContext';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type StepState = 'idle' | 'uploading' | 'validating' | 'preview' | 'success' | 'error';

export const ImportDataModal: React.FC<ImportDataModalProps> = ({ isOpen, onClose }) => {
  const { importData } = useInventory();

  const [stepState, setStepState] = useState<StepState>('idle');
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    try {
      setStepState('uploading');
      setErrorMessage(null);

      // Simulate step progress for user clarity
      setTimeout(async () => {
        try {
          setStepState('validating');
          const result = await parseAndValidateImportFile(file);
          setValidationResult(result);
          setStepState('preview');
        } catch (err: any) {
          setErrorMessage(err.message || 'Failed to parse inventory file.');
          setStepState('error');
        }
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error uploading file.');
      setStepState('error');
    }
  };

  const handleConfirmImport = () => {
    if (!validationResult) return;

    try {
      importData(validationResult.parsedProducts, validationResult.parsedSales);
      setStepState('success');
      setTimeout(() => {
        onClose();
        setStepState('idle');
        setValidationResult(null);
      }, 1200);
    } catch (err: any) {
      setErrorMessage('Failed to commit import into database.');
      setStepState('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Import Inventory Data</h2>
              <p className="text-xs text-slate-500">Upload your sales or inventory Excel/CSV file to automatically analyze</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Step 1: File Drop Zone */}
          {stepState === 'idle' && (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/20 hover:bg-indigo-50/50 transition-all rounded-2xl p-8 text-center cursor-pointer group"
            >
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileInput}
                id="file-upload-input"
                className="hidden"
              />
              <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-slate-800">Drag & Drop your dataset here</p>
                <p className="text-xs text-slate-500 mt-1">or click to browse from computer</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-semibold text-slate-600 shadow-sm">
                    .CSV
                  </span>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-semibold text-slate-600 shadow-sm">
                    .XLSX
                  </span>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-semibold text-slate-600 shadow-sm">
                    .XLS
                  </span>
                </div>
              </label>
            </div>
          )}

          {/* Loading States */}
          {(stepState === 'uploading' || stepState === 'validating') && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {stepState === 'uploading' ? 'Uploading & Parsing File...' : 'Validating & Cleaning Schema...'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Calculating inventory velocity & demand metrics</p>
              </div>
            </div>
          )}

          {/* Step 2: Validation Preview */}
          {stepState === 'preview' && validationResult && (
            <div className="space-y-4">
              {/* Validation Summary Pills */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-indigo-600" /> {validationResult.fileName}
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    {(validationResult.fileSize / 1024).toFixed(1)} KB
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase block font-semibold">Total Rows</span>
                    <span className="font-bold text-slate-900 text-sm">✓ {validationResult.totalRows.toLocaleString()}</span>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase block font-semibold">Products Parsed</span>
                    <span className="font-bold text-slate-900 text-sm">✓ {validationResult.parsedProducts.length}</span>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase block font-semibold">Sales Records</span>
                    <span className="font-bold text-slate-900 text-sm">✓ {validationResult.parsedSales.length}</span>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase block font-semibold">Data Quality</span>
                    <span className="font-bold text-emerald-600 text-sm">
                      {validationResult.missingValuesCount > 0 ? `⚠ ${validationResult.missingValuesCount} missing` : '✓ 100% Clean'}
                    </span>
                  </div>
                </div>

                {validationResult.missingColumns.length > 0 && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Warning: Could not detect standard columns: {validationResult.missingColumns.join(', ')}. Default values applied where necessary.</span>
                  </div>
                )}
              </div>

              {/* Data Preview Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Data Preview (First 5 Rows)</h4>
                <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-48">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-2">Product Name</th>
                        <th className="p-2">SKU</th>
                        <th className="p-2">Category</th>
                        <th className="p-2">Price</th>
                        <th className="p-2">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {validationResult.parsedProducts.slice(0, 5).map((p, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2 font-medium text-slate-900">{p.name}</td>
                          <td className="p-2 text-slate-500">{p.sku}</td>
                          <td className="p-2 text-slate-600">{p.category}</td>
                          <td className="p-2 font-semibold text-indigo-600">₹{p.unitPrice}</td>
                          <td className="p-2 text-slate-800 font-bold">{p.currentStock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <button 
                  onClick={() => { setStepState('idle'); setValidationResult(null); }} 
                  className="btn-secondary text-xs"
                >
                  Choose Different File
                </button>
                <button 
                  onClick={handleConfirmImport} 
                  className="btn-primary text-xs"
                >
                  Import & Analyze Data <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Success Notification */}
          {stepState === 'success' && (
            <div className="py-12 flex flex-col items-center text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
              <p className="text-base font-bold text-slate-900">Import & Analysis Complete!</p>
              <p className="text-xs text-slate-500">Dashboard metrics and forecasts have been automatically updated.</p>
            </div>
          )}

          {/* Error View */}
          {stepState === 'error' && (
            <div className="py-8 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Import Failed</p>
                <p className="text-xs text-rose-600 mt-1 max-w-md mx-auto">{errorMessage}</p>
              </div>
              <button 
                onClick={() => { setStepState('idle'); setErrorMessage(null); }} 
                className="btn-primary text-xs"
              >
                Try Again
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
