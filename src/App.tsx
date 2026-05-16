import React, { useState } from 'react';
import axios from 'axios';
import { LandingPage } from './components/LandingPage';
import { PDFViewer } from './components/PDFViewer';
import { ChatInterface } from './components/ChatInterface';
import { chatWithPDF } from './services/geminiService';
import { 
  FileText, 
  Layout, 
  MessageSquare, 
  PanelLeftClose, 
  PanelLeftOpen,
  History,
  Trash2,
  FileSearch,
  BookOpen,
  HelpCircle,
  History as HistoryIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function App() {
  const [file, setFile] = useState<{ 
    originalName: string, 
    path: string, 
    filename: string, 
    localUrl: string,
    base64: string 
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleFileUpload = async (rawFile: File) => {
    const MAX_SIZE_MB = 25;
    const fileSizeMB = rawFile.size / (1024 * 1024);

    if (fileSizeMB > MAX_SIZE_MB) {
      alert(`Your file size is -${fileSizeMB.toFixed(2)} MB. Files up to ${MAX_SIZE_MB} MB are allowed only`);
      return;
    }

    setIsUploading(true);
    const localUrl = URL.createObjectURL(rawFile);
    
    const reader = new FileReader();
    reader.readAsDataURL(rawFile);
    
    reader.onload = async () => {
      const base64String = (reader.result as string).split(',')[1];
      
      try {
        const formData = new FormData();
        formData.append('pdf', rawFile);
        const res = await axios.post('/api/upload', formData);
        
        setFile({
          originalName: res.data.originalName,
          path: res.data.path,
          filename: res.data.filename,
          localUrl: localUrl,
          base64: base64String
        });
        setIsUploading(false);
      } catch (error) {
        console.error('Upload failed:', error);
        setIsUploading(false);
        alert('Upload failed. Please try again.');
      }
    };
  };

  const handleSendMessage = async (text: string) => {
    if (!file) return;

    const userMessage: Message = { role: 'user', text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoadingAI(true);

    try {
      const response = await chatWithPDF(file.base64, text, messages);
      setMessages([...newMessages, { role: 'model', text: response }]);
    } catch (error) {
      console.error('AI Chat failed:', error);
      setMessages([...newMessages, { role: 'model', text: 'Error: Failed to process document. Please try again later.' }]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleQuickAction = async (action: 'summary' | 'mcq' | 'notes') => {
    if (!file || isLoadingAI) return;
    
    let prompt = "";
    if (action === 'summary') prompt = "Generate a concise summary of this PDF, highlighting the key points and chapters.";
    if (action === 'mcq') prompt = "Generate 5 multiple choice questions based on the content of this PDF, including answers at the end.";
    if (action === 'notes') prompt = "Generate structured study notes from this PDF, using bullet points and clear headings.";

    handleSendMessage(prompt);
  };

  if (!file) {
    return <LandingPage onFileUpload={handleFileUpload} isUploading={isUploading} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden relative font-sans">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 z-20 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            className="fixed md:relative inset-y-0 left-0 w-[280px] bg-white border-r border-slate-200 flex flex-col z-30 shadow-2xl md:shadow-none"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-display font-bold tracking-tight text-slate-900">Docu<span className="text-indigo-600">Mind</span></h1>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors group"
              >
                <PanelLeftClose className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-8">
              <section>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 px-2">Active Document</h3>
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3 group transition-all">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <FileSearch className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-indigo-900 truncate">{file.originalName}</p>
                    <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Source Ready</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 px-2">Analysis Tools</h3>
                <div className="space-y-2">
                  <SidebarAction 
                    icon={<FileText className="w-4 h-4" />} 
                    label="Summarize Document" 
                    onClick={() => handleQuickAction('summary')} 
                    disabled={isLoadingAI}
                  />
                  <SidebarAction 
                    icon={<BookOpen className="w-4 h-4" />} 
                    label="Generate Study Notes" 
                    onClick={() => handleQuickAction('notes')}
                    disabled={isLoadingAI}
                  />
                  <SidebarAction 
                    icon={<HelpCircle className="w-4 h-4" />} 
                    label="Quick Practice Quiz" 
                    onClick={() => handleQuickAction('mcq')}
                    disabled={isLoadingAI}
                  />
                </div>
              </section>

              <div className="mt-auto pt-6 border-t border-slate-100">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] text-slate-500 mb-2 font-bold uppercase tracking-wider">AI Memory Status</p>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="w-[85%] h-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.2)]"></div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">Active Session Context High</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={() => setFile(null)}
                className="w-full flex items-center justify-center gap-2 p-3 text-xs font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-slate-200 hover:border-red-200 uppercase tracking-widest active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                Discard Session
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!sidebarOpen && (
        <button 
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 p-2 bg-white border border-slate-200 rounded-lg shadow-xl hover:bg-slate-50 transition-all group"
        >
          <PanelLeftOpen className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
        </button>
      )}

      {/* Main Content Areas */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className={`w-full md:w-1/2 h-[50vh] md:h-full overflow-hidden border-r border-slate-200 ${sidebarOpen ? 'max-md:hidden' : 'block'}`}>
          <PDFViewer fileUrl={file.localUrl} />
        </div>
        <div className={`w-full md:w-1/2 flex-1 h-full ${sidebarOpen ? 'max-md:hidden' : 'block'}`}>
          <ChatInterface 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            isLoading={isLoadingAI}
            onClearChat={() => setMessages([])}
          />
        </div>
      </main>
    </div>
  );
}

const SidebarAction = ({ icon, label, onClick, disabled }: { icon: React.ReactNode, label: string, onClick: () => void, disabled: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100 disabled:opacity-50 group tracking-tight"
  >
    <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-indigo-200/50 group-hover:text-indigo-700 transition-colors">
      {icon}
    </div>
    {label}
  </button>
);
