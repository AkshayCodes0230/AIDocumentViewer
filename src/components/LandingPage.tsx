import React, { useRef, useState } from 'react';
import { Upload, FileText, Sparkles, Zap, BrainCircuit, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onFileUpload, isUploading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      onFileUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileUpload(file);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 overflow-hidden relative font-sans">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-[radial-gradient(circle_at_50%_50%,#f1f5f9_0%,#f8fafc_100%)]">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-200/30 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-200/30 blur-[150px] rounded-full animate-pulse [animation-delay:2s]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-10 max-w-4xl"
      >
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></div>
          Gemini 1.5 Pro Initialized
        </div>
        
        <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tight text-slate-900">
          Docu<span className="text-indigo-600">Mind</span> AI
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
          The ultimate research assistant. Upload complex documents and extract insights through natural conversation.
        </p>

        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            mt-12 p-12 md:p-20 cursor-pointer relative border border-slate-200 rounded-[40px] transition-all duration-500
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-50 ring-8 ring-indigo-500/5' 
              : 'bg-white hover:bg-slate-50 hover:border-slate-300'
            }
            shadow-2xl backdrop-blur-3xl group
          `}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 rounded-[40px] border border-white"></div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".pdf"
          />
          
          <div className="flex flex-col items-center space-y-6 relative z-10">
            {isUploading ? (
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                <Zap className="w-10 h-10 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-500">
                <Upload className="w-10 h-10 text-white" />
              </div>
            )}
            
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-bold text-slate-900">
                {isUploading ? 'Analyzing Contents...' : 'Drop PDF Here'}
              </h3>
              <p className="text-sm text-slate-400 font-medium">
                Maximum secure upload size: 25MB
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 pt-12 border-t border-slate-200">
          <LandingFeature 
            icon={<Zap className="w-5 h-5" />} 
            title="Instant Context" 
            desc="Global document retrieval in under 500ms."
          />
          <LandingFeature 
            icon={<BrainCircuit className="w-5 h-5" />} 
            title="Neural Synthesis" 
            desc="Context-aware reasoning from Gemini 1.5."
          />
          <LandingFeature 
            icon={<Sparkles className="w-5 h-5" />} 
            title="Verified Output" 
            desc="Source-backed responses with page citations."
          />
        </div>
      </motion.div>

      <footer className="mt-20 text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
        High Performance AI • © 2026 DocuMind
      </footer>
    </div>
  );
};

const LandingFeature = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex flex-col items-center text-center space-y-3 group">
    <div className="p-4 rounded-2xl bg-white text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all border border-slate-100 group-hover:border-indigo-100 shadow-sm group-hover:shadow-md">
      {icon}
    </div>
    <div className="space-y-1">
      <h4 className="font-display font-bold text-sm text-slate-800">{title}</h4>
      <p className="text-xs text-slate-400 max-w-[180px] leading-relaxed font-medium">{desc}</p>
    </div>
  </div>
);
