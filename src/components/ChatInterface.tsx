import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Copy, Check, Trash2, Printer, FileDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { marked } from 'marked';
import { Message } from '../App';
import { motion, AnimatePresence } from 'motion/react';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onClearChat: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading,
  onClearChat 
}) => {
  const [input, setInput] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownload = (text: string, filename: string = 'documind-analysis.txt') => {
    const timestamp = new Date().toLocaleString();
    const structuredText = `
╔══════════════════════════════════════════════════════════════╗
║                    DOCUMIND AI ANALYSIS                      ║
╚══════════════════════════════════════════════════════════════╝
  Generated on: ${timestamp}
────────────────────────────────────────────────────────────────

${text}

────────────────────────────────────────────────────────────────
  © 2026 DocuMind AI Research Assistant
  High Performance Analysis • Encrypted Session
────────────────────────────────────────────────────────────────
`;
    const blob = new Blob([structuredText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = async (text: string) => {
    const htmlContent = await marked.parse(text);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const timestamp = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>DocuMind Analysis Report</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            @media print {
              body { padding: 0; margin: 0; }
              .no-print { display: none; }
            }
            body { 
              font-family: 'Inter', -apple-system, sans-serif; 
              line-height: 1.6; 
              padding: 60px; 
              color: #1e293b; 
              max-width: 850px; 
              margin: 0 auto;
              background: #fff;
            }
            header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 50px;
              border-bottom: 4px solid #4f46e5;
              padding-bottom: 20px;
            }
            .logo {
              font-size: 28px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: -0.025em;
            }
            .logo span {
              color: #4f46e5;
            }
            .date {
              font-size: 14px;
              color: #64748b;
              font-weight: 600;
            }
            .content {
              font-size: 16px;
              color: #334155;
            }
            .content h1, .content h2, .content h3 {
              color: #0f172a;
              margin-top: 1.5em;
              margin-bottom: 0.5em;
            }
            .content p { margin-bottom: 1.25em; }
            .content ul, .content ol { padding-left: 1.5em; margin-bottom: 1.25em; }
            .content li { margin-bottom: 0.5em; }
            .content blockquote {
              border-left: 4px solid #e2e8f0;
              padding-left: 20px;
              margin: 20px 0;
              color: #64748b;
              font-style: italic;
            }
            .content strong { color: #4f46e5; font-weight: 700; }
            .content code {
              background: #f1f5f9;
              padding: 2px 6px;
              border-radius: 4px;
              font-family: monospace;
              font-size: 0.9em;
            }
            footer {
              margin-top: 80px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              font-size: 12px;
              color: #94a3b8;
              text-align: center;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 0.1em;
            }
            .watermark {
              position: fixed;
              bottom: 40px;
              right: 40px;
              opacity: 0.05;
              font-size: 80px;
              font-weight: 900;
              pointer-events: none;
              transform: rotate(-30deg);
              z-index: -1;
            }
          </style>
        </head>
        <body>
          <header>
            <div class="logo">Docu<span>Mind</span> AI</div>
            <div class="date">${timestamp}</div>
          </header>
          
          <div class="content">
            ${htmlContent}
          </div>
          
          <div class="watermark">DOCUMIND</div>
          
          <footer>
            Professional Analysis • Generated by DocuMind Research Assistant • Secure Session
          </footer>
          
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.onafterprint = () => window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col h-full bg-white border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <h2 className="font-display font-bold text-sm flex items-center gap-3 text-slate-800">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.3)]"></span>
          DocuMind AI Assistant
        </h2>
        <button
          onClick={onClearChat}
          className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-50"
        >
          Clear Memory
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-[200px] mx-auto opacity-40 grayscale-[0.5]">
            <div className="p-5 bg-slate-100 rounded-3xl">
              <Bot className="w-12 h-12 stroke-[1.5] text-slate-400" />
            </div>
            <p className="text-xs leading-relaxed font-bold tracking-tight text-slate-500 uppercase tracking-[0.1em]">System Ready. Start a conversation.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${
                msg.role === 'user' 
                  ? 'bg-slate-100 border border-slate-200' 
                  : 'bg-indigo-600 shadow-indigo-600/20'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-slate-600" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              
              <div className={`relative group max-w-[85%] ${
                msg.role === 'user' ? 'text-right' : 'text-left'
              }`}>
                <div className={`inline-block p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-50 border border-indigo-100 text-indigo-900 font-medium rounded-tr-none'
                    : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-none'
                }`}>
                  <div className="markdown-body text-left">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                  </div>
                </div>

                {msg.role === 'model' && (
                  <div className="absolute -bottom-7 left-0 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => copyToClipboard(msg.text, idx)}
                      className="p-1 text-[10px] text-slate-400 hover:text-indigo-600 font-bold tracking-widest flex items-center gap-1 uppercase transition-colors"
                    >
                      {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {copiedIndex === idx ? 'Copied' : 'Copy'}
                    </button>
                    <div className="w-px h-2 bg-slate-200" />
                    <button
                      onClick={() => handleDownload(msg.text)}
                      className="p-1 text-[10px] text-slate-400 hover:text-indigo-600 font-bold tracking-widest flex items-center gap-1 uppercase transition-colors"
                    >
                      <FileDown className="w-3 h-3" />
                      Save
                    </button>
                    <div className="w-px h-2 bg-slate-200" />
                    <button
                      onClick={() => handlePrint(msg.text)}
                      className="p-1 text-[10px] text-slate-400 hover:text-indigo-600 font-bold tracking-widest flex items-center gap-1 uppercase transition-colors"
                    >
                      <Printer className="w-3 h-3" />
                      Print
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm font-bold text-[10px] text-slate-400 tracking-wider uppercase">
              DocuMind is thinking...
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-6 border-t border-slate-100 bg-white">
        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-focus-within:opacity-10 transition-opacity blur-lg"></div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Query your document..."
            disabled={isLoading}
            rows={1}
            autoFocus
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-slate-800 placeholder:text-slate-400 resize-none pr-14 block"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-3 bottom-3 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
        <div className="flex items-center justify-between mt-3 px-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">
          <span>AI-Powered Link</span>
          <span>Encrypted Session</span>
        </div>
      </div>
    </div>
  );
};
