"use client";

import { useState } from "react";
import { Upload, Download, FileSpreadsheet, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Container from "@/app/dashboard/_components/Container";
import { useToastContext } from "@/app/dashboard/_components/Toaster";
import {
  productsService, ordersService, shopsService, sectionsService, heroBannersService
} from "@/app/dashboard/_lib/services";

const MODULES = [
  { value: "products", label: "Products", service: productsService, app: "products", model: "product" },
  { value: "orders", label: "Orders", service: ordersService, app: "orders", model: "order" },
  { value: "shops", label: "Shops", service: shopsService, app: "shops", model: "shop" },
  { value: "sections", label: "Sections", service: sectionsService, app: "sections", model: "section" },
  { value: "banners", label: "Hero Banners", service: heroBannersService, app: "website", model: "herobanner" },
];

export default function ImportExportPage() {
  const toast = useToastContext();
  const [importModule, setImportModule] = useState("products");
  const [exportModule, setExportModule] = useState("products");
  const [exportFormat, setExportFormat] = useState("csv");
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [exporting, setExporting] = useState(false);

  const getService = (moduleVal) => MODULES.find((m) => m.value === moduleVal);

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      const mod = getService(importModule);
      const result = await mod.service.importFile(file);
      setImportResult({ success: true, message: result?.message || "Import completed successfully" });
      toast.success("Import completed");
      setFile(null);
    } catch (err) {
      setImportResult({ success: false, message: err?.message || "Import failed" });
      toast.error(err?.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const mod = getService(exportModule);
      if (exportFormat === "csv") {
        await mod.service.exportCsv();
      } else {
        await mod.service.exportExcel();
      }
      toast.success("Export downloaded");
    } catch (err) {
      toast.error(err?.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Container title="Import / Export" description="Bulk data operations">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Import */}
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-gray-400" />
            <h2 className="text-base font-medium text-gray-900 dark:text-white">Import Data</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Module</label>
              <select
                value={importModule}
                onChange={(e) => setImportModule(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-400"
              >
                {MODULES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File</label>
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="import-file"
                />
                <label htmlFor="import-file" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    {file ? (
                      <>
                        <FileSpreadsheet className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                        <p className="text-sm text-gray-500">Click to upload CSV or Excel</p>
                        <p className="text-xs text-gray-400 mt-1">Max 10MB</p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={handleImport}
              disabled={!file || importing}
              className="w-full py-2 px-4 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {importing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Importing...</>
              ) : (
                <><Upload className="w-4 h-4" /> Import</>
              )}
            </button>

            {importResult && (
              <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${importResult.success ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"}`}>
                {importResult.success ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                <div>
                  <p className="font-medium">{importResult.success ? "Import complete" : "Import failed"}</p>
                  <p className="text-xs mt-0.5">{importResult.message}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Export */}
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-gray-400" />
            <h2 className="text-base font-medium text-gray-900 dark:text-white">Export Data</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Module</label>
              <select
                value={exportModule}
                onChange={(e) => setExportModule(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-400"
              >
                {MODULES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setExportFormat("csv")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium transition-colors ${exportFormat === "csv" ? "border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white" : "border border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"}`}
                >
                  <FileText className="w-4 h-4" /> CSV
                </button>
                <button
                  onClick={() => setExportFormat("excel")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium transition-colors ${exportFormat === "excel" ? "border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white" : "border border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"}`}
                >
                  <FileSpreadsheet className="w-4 h-4" /> Excel
                </button>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full py-2 px-4 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {exporting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Exporting...</>
              ) : (
                <><Download className="w-4 h-4" /> Export</>
              )}
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
}
