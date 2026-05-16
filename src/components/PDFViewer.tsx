import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  fileUrl: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => Math.min(Math.max(1, prevPageNumber + offset), numPages || 1));
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white z-10 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Page {pageNumber} of {numPages || '--'}
          </span>
          <div className="flex items-center bg-slate-50 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => changePage(-1)}
              disabled={pageNumber <= 1}
              className="p-1 rounded hover:bg-white disabled:opacity-20 transition-all shadow-sm border border-transparent hover:border-slate-100"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button
              onClick={() => changePage(1)}
              disabled={pageNumber >= (numPages || 1)}
              className="p-1 rounded hover:bg-white disabled:opacity-20 transition-all shadow-sm border border-transparent hover:border-slate-100"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-50 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
              className="p-1 rounded hover:bg-white transition-all shadow-sm border border-transparent hover:border-slate-100"
            >
              <ZoomOut className="w-4 h-4 text-slate-600" />
            </button>
            <span className="text-[10px] font-bold w-12 text-center text-slate-500 uppercase tracking-tighter">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(s => Math.min(2.0, s + 0.1))}
              className="p-1 rounded hover:bg-white transition-all shadow-sm border border-transparent hover:border-slate-100"
            >
              <ZoomIn className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 scrollbar-hide bg-slate-50 flex justify-center items-start">
        <div className="shadow-[0_0_50px_rgba(0,0,0,0.08)] border border-slate-200 rounded-sm overflow-hidden bg-white">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Rendering PDF...</span>
              </div>
            }
          >
            <Page 
              pageNumber={pageNumber} 
              scale={scale} 
              renderAnnotationLayer={true}
              renderTextLayer={true}
              className="shadow-inner"
            />
          </Document>
        </div>
      </div>
    </div>
  );
};
