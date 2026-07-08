import React, { useState, useRef, useEffect } from 'react';
import { useResearch } from './ResearchContext';
import { BookOpen, Sparkles, Send, ShieldAlert, Zap, Cpu, ClipboardCopy } from 'lucide-react';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
}

export default function ResearchCopilotTab() {
  const { activeProject, activePrediction, token } = useResearch();
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'assistant', text: 'Hello! I am your GeneVision AI Biological Copilot. How can I assist you with clinical mutations, quantum SVN configurations, or genetic pathway analysis today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    
    const userMsg = textToSend.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          messages: messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          })),
          newMessage: userMsg,
          contextProjectId: activeProject?.id || undefined,
          contextPredictionId: activePrediction?.id || undefined,
          diseaseType: activeProject?.diseaseType || 'Breast Cancer'
        })
      });
      const data = await res.json();
      const reply = data.content || data.reply || 'No response received from the clinical copilot.';
      setMessages(prev => [...prev, { sender: 'assistant', text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'assistant', text: 'An error occurred. Please ensure your server and API connections are healthy.' }]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Explain the role of BRCA1 in double-strand DNA homologous recombination.',
    'How does a Parameterized Quantum Circuit (PQC) improve gene classification over classical SVM?',
    'What targeted therapeutics are available for late-onset Alzheimer’s with ε4 risk alleles?',
    'Interpret a high SHAP waterfall value of +0.42 for TP53 in cancer screening.'
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Title */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-white">AI Research Copilot</h2>
        <p className="text-slate-500 text-xs font-mono uppercase mt-1">Converse with Gemini clinical agents to isolate driver nodes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[500px]">
        {/* Chat Interface (Left) */}
        <div className="lg:col-span-8 flex flex-col p-4 rounded-2xl border border-slate-900 bg-slate-950 h-full">
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 select-text">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-mono text-xs font-bold ${
                  m.sender === 'user' ? 'bg-slate-800 text-white' : 'bg-gradient-to-br from-emerald-500 to-blue-600 text-slate-950'
                }`}>
                  {m.sender === 'user' ? 'R' : 'AI'}
                </div>

                <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-slate-900 border-slate-800 text-white'
                    : 'bg-slate-900/40 border-slate-900 text-slate-300'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 text-slate-950 flex items-center justify-center font-bold font-mono text-xs animate-pulse">
                  AI
                </div>
                <div className="p-4 rounded-2xl border border-slate-900 bg-slate-900/40 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Form input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex gap-2 border-t border-slate-900 pt-3 shrink-0"
          >
            <input
              type="text"
              placeholder={loading ? 'Thinking...' : 'Ask the clinical copilot a question...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition disabled:bg-slate-900 disabled:text-slate-600 cursor-pointer"
            >
              <Send className="w-4 h-4 fill-current" />
            </button>
          </form>
        </div>

        {/* Suggested Queries & Parameters (Right) */}
        <div className="lg:col-span-4 flex flex-col justify-between p-6 rounded-2xl border border-slate-900 bg-slate-950 h-full">
          <div className="space-y-4">
            <h4 className="text-sm font-mono font-bold tracking-wider text-slate-500 uppercase flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" /> QUICK PRIMERS
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click any of the pre-composed scientific inquiries to query the Gemini clinical knowledge engine immediately:
            </p>

            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {samplePrompts.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  disabled={loading}
                  className="w-full p-2.5 rounded border border-slate-900 hover:border-slate-850 bg-slate-900/10 hover:bg-slate-900/30 text-[10px] text-left text-slate-400 hover:text-emerald-400 font-mono leading-snug transition flex items-center justify-between group cursor-pointer"
                >
                  <span className="flex-1 pr-2">{prompt}</span>
                  <ClipboardCopy className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900 space-y-1">
            <div className="flex justify-between font-mono text-[9px] text-slate-500 uppercase">
              <span>Model Node:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Cpu className="w-3 h-3 text-yellow-400 animate-pulse" /> Gemini Flash 2.5
              </span>
            </div>
            {activeProject && (
              <div className="flex justify-between font-mono text-[9px] text-slate-500 uppercase">
                <span>Context Disease:</span>
                <span className="text-white font-bold">{activeProject.diseaseType}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
