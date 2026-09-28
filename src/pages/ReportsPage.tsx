import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  CheckCircle2
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const triggerDownload = (reportName: string) => {
    setDownloadToast(reportName);
    setTimeout(() => setDownloadToast(null), 3000);
  };

  const reports = [
    {
      id: 'REP-01',
      title: 'Full Impact Report',
      desc: 'Complete audit report with economic waterfall and environmental ledgers.',
      type: 'PDF / Executive Format',
      size: '2.4 MB'
    },
    {
      id: 'REP-02',
      title: 'Allocation Summary',
      desc: 'Detailed material flow and destination allocation breakdown.',
      type: 'CSV / Excel Spreadsheet',
      size: '840 KB'
    },
    {
      id: 'REP-03',
      title: 'Economic Analysis',
      desc: 'Net cost comparison and baseline vs optimized savings waterfall.',
      type: 'PDF / Financial Audit',
      size: '1.2 MB'
    },
    {
      id: 'REP-04',
      title: 'Environmental Analysis',
      desc: 'Emissions factor source trace and comparative CO2e delta accounting.',
      type: 'PDF / ISO 14040 Format',
      size: '1.8 MB'
    },
    {
      id: 'REP-05',
      title: 'Technical Screening Report',
      desc: 'IS 3812 chemical composition, physical properties, and feasibility documentation.',
      type: 'PDF / Technical Spec',
      size: '3.1 MB'
    }
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-green-700" /> Reports & Export Hub
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Download printable environmental audit reports, CSV allocation ledgers, and executive summaries.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Export Engine Status:</span>
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 border border-green-200 font-bold">
            READY FOR EXPORT
          </span>
        </div>
      </div>

      {/* Reports List Cards */}
      <div className="space-y-4">
        {reports.map((r) => (
          <div 
            key={r.id}
            className="industrial-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-green-300 transition-all text-xs"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] text-green-800 font-bold uppercase bg-green-100 px-2.5 py-0.5 rounded-full border border-green-200 font-mono">
                  {r.id}
                </span>
                <h3 className="text-base font-bold text-slate-900">{r.title}</h3>
              </div>
              <p className="text-slate-600 text-xs font-normal">{r.desc}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 font-medium">
                <span>Format: <strong className="text-slate-800">{r.type}</strong></span>
                <span>File Size: <strong className="text-slate-800">{r.size}</strong></span>
              </div>
            </div>

            <button
              onClick={() => triggerDownload(r.title)}
              className="industrial-button-green shrink-0 px-5 py-2.5"
            >
              <Download className="w-4 h-4" /> Download Report
            </button>
          </div>
        ))}
      </div>

      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-green-300 text-slate-800 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <div className="font-bold text-green-900 text-sm">Export Complete</div>
            <div className="text-xs text-slate-500">Downloaded {downloadToast}</div>
          </div>
        </div>
      )}
    </div>
  );
};
