import React, { useState } from 'react';
import { FileBarChart, Download, FileText, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { Badge } from '../components/common/Badge';

export const ReportsPage = () => {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadReport = async (format = 'csv') => {
    setDownloading(true);
    try {
      const response = await api.get(`/reports/download?format=${format}`, {
        responseType: format === 'csv' ? 'blob' : 'json',
      });

      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `dental_workforce_intelligence_report_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(response.data, null, 2));
        const link = document.createElement('a');
        link.href = dataStr;
        link.setAttribute('download', `dental_workforce_report_${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      console.error('Error downloading report:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Reports & Analytics Governance</h1>
          <p className="text-xs text-slate-400 mt-1">Export aggregate operational metrics, skill inventory summaries, and compliance audit trails.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownloadReport('csv')}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50"
          >
            {downloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export Complete CSV Report
          </button>
        </div>
      </div>

      {/* Available Executive Report Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-sky-500/40 transition-colors">
          <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400 w-fit">
            <FileBarChart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">Network Capacity & Chair Utilization</h3>
            <p className="text-xs text-slate-400 mt-1">Chair loading %, average patient wait times, treatment acceptance rate, and cancellation telemetry across 10 clinics.</p>
          </div>
          <button
            onClick={() => handleDownloadReport('json')}
            className="w-full py-2 bg-slate-850 hover:bg-slate-800 text-sky-400 border border-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Download Analytics (JSON)
          </button>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-purple-500/40 transition-colors">
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 w-fit">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">Skill Inventory & Deficit Matrix</h3>
            <p className="text-xs text-slate-400 mt-1">Cross-clinic 1-5 proficiency mapping, verified board certifications, and gap heat maps.</p>
          </div>
          <button
            onClick={() => handleDownloadReport('csv')}
            className="w-full py-2 bg-slate-850 hover:bg-slate-800 text-purple-400 border border-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Download Matrix (CSV)
          </button>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-emerald-500/40 transition-colors">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 w-fit">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">Human Override & Audit Trail</h3>
            <p className="text-xs text-slate-400 mt-1">Immutable audit logs mapping Grok AI runs, confidence scores, manager decisions, and justification reasons.</p>
          </div>
          <button
            onClick={() => handleDownloadReport('csv')}
            className="w-full py-2 bg-slate-850 hover:bg-slate-800 text-emerald-400 border border-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Download Audit Logs (CSV)
          </button>
        </div>
      </div>
    </div>
  );
};
