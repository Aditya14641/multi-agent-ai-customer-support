'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { sendMessage, createSession, getChatHistory, getSessions } from '@/services/api';
import toast, { Toaster } from 'react-hot-toast';
import { Send, Plus, LogOut, Bot, User, BarChart2, Menu, Zap } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  agents_used?: string[];
}

interface Session {
  session_id: string;
  created_at: string;
}

const agentConfig: Record<string, { bg: string; emoji: string }> = {
  billing:   { bg: 'bg-green-500',  emoji: '💳' },
  technical: { bg: 'bg-blue-500',   emoji: '🔧' },
  product:   { bg: 'bg-purple-500', emoji: '📦' },
  complaint: { bg: 'bg-red-500',    emoji: '📢' },
  faq:       { bg: 'bg-yellow-500', emoji: '📋' },
  refund:    { bg: 'bg-orange-500', emoji: '🔄' },
};

// ── Inline formatter: **bold**, *italic*, `code` ──────────────────
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
        if (part.startsWith('*') && part.endsWith('*'))
          return <em key={i} className="text-blue-200 italic">{part.slice(1, -1)}</em>;
        if (part.startsWith('`') && part.endsWith('`'))
          return <code key={i} className="bg-gray-900 text-green-400 px-1.5 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ── Table renderer ────────────────────────────────────────────────
function renderTable(tableLines: string[], key: number) {
  // Parse rows — skip separator lines like |---|---|
  const rows = tableLines
    .filter(l => !l.replace(/\s/g, '').match(/^\|[-:|]+\|$/))
    .map(l =>
      l.split('|')
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
        .map(c => c.trim())
    )
    .filter(r => r.length > 0);

  if (rows.length === 0) return null;

  const headers = rows[0];
  const body = rows.slice(1);

  return (
    <div key={`tbl-${key}`} className="my-3 rounded-xl overflow-hidden border border-blue-800/50 shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse min-w-max">
          <thead>
            <tr className="bg-gradient-to-r from-blue-900 to-indigo-900">
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-2.5 text-left text-blue-200 font-bold uppercase tracking-wider whitespace-nowrap border-b border-blue-700">
                  {renderInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri} className={`transition hover:bg-blue-900/20 ${ri % 2 === 0 ? 'bg-gray-800/70' : 'bg-gray-900/70'}`}>
                {row.map((cell, ci) => {
                  const isPrice = cell.match(/^\$[\d,]+/);
                  const isFirst = ci === 0;
                  return (
                    <td key={ci} className={`px-3 py-2 border-b border-gray-700/40 whitespace-nowrap ${isFirst ? 'text-white font-semibold' : 'text-gray-300'}`}>
                      {isPrice
                        ? <span className="text-green-400 font-bold">{cell}</span>
                        : renderInline(cell)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main message renderer ─────────────────────────────────────────
function renderMessage(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let k = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // ── TABLE: collect consecutive pipe lines ──
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      const tbl = renderTable(tableLines, k++);
      if (tbl) elements.push(tbl);
      continue;
    }

    // ── EMPTY LINE ──
    if (trimmed === '') {
      elements.push(<div key={`sp-${k++}`} className="h-1.5" />);
      i++; continue;
    }

    // ── H1 ──
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${k++}`} className="text-blue-300 font-extrabold text-xl mt-2 mb-1">
          {renderInline(line.slice(2))}
        </h1>
      );
      i++; continue;
    }

    // ── H2 ──
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${k++}`} className="text-white font-bold text-lg mt-3 mb-1 pb-1 border-b border-gray-600">
          {renderInline(line.slice(3))}
        </h2>
      );
      i++; continue;
    }

    // ── H3 ──
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${k++}`} className="text-blue-400 font-bold text-base mt-2 mb-0.5">
          {renderInline(line.slice(4))}
        </h3>
      );
      i++; continue;
    }

    // ── STANDALONE BOLD LINE e.g. **Key Features:** ──
    if (trimmed.match(/^\*\*.+\*\*:?$/) && !trimmed.startsWith('- ')) {
      const text = trimmed.replace(/\*\*/g, '').replace(/:$/, '');
      elements.push(
        <div key={`bh-${k++}`} className="mt-3 mb-0.5 flex items-center gap-2">
          <div className="h-0.5 w-2 bg-blue-500 rounded"/>
          <span className="text-white font-bold text-sm uppercase tracking-wide">{text}</span>
        </div>
      );
      i++; continue;
    }

    // ── NUMBERED LIST ──
    const numMatch = trimmed.match(/^(\d+)\.\s(.+)/);
    if (numMatch) {
      elements.push(
        <div key={`nl-${k++}`} className="flex gap-3 items-start py-0.5 ml-1">
          <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold mt-0.5">
            {numMatch[1]}
          </span>
          <span className="text-gray-100 text-sm flex-1 leading-relaxed">{renderInline(numMatch[2])}</span>
        </div>
      );
      i++; continue;
    }

    // ── BULLET LIST ──
    if (trimmed.match(/^[-•*]\s/)) {
      const text = trimmed.replace(/^[-•*]\s/, '');
      elements.push(
        <div key={`bl-${k++}`} className="flex gap-2 items-start py-0.5 ml-1">
          <span className="text-blue-400 mt-1.5 flex-shrink-0 text-xs">▸</span>
          <span className="text-gray-100 text-sm flex-1 leading-relaxed">{renderInline(text)}</span>
        </div>
      );
      i++; continue;
    }

    // ── INDENTED BULLET ──
    if (line.match(/^\s{2,}[-•]\s/)) {
      const text = trimmed.replace(/^[-•]\s/, '');
      elements.push(
        <div key={`ib-${k++}`} className="flex gap-2 items-start py-0.5 ml-6">
          <span className="text-gray-500 mt-1.5 flex-shrink-0 text-xs">◦</span>
          <span className="text-gray-300 text-sm flex-1">{renderInline(text)}</span>
        </div>
      );
      i++; continue;
    }

    // ── DIVIDER ──
    if (trimmed === '---' || trimmed === '___' || trimmed === '***') {
      elements.push(<hr key={`hr-${k++}`} className="border-gray-700 my-2" />);
      i++; continue;
    }

    // ── TICKET REF ──
    if (trimmed.match(/TCK-[\w\d]+/)) {
      elements.push(
        <div key={`tk-${k++}`} className="bg-yellow-900/30 border border-yellow-600/40 rounded-lg px-3 py-2 my-1 flex items-center gap-2">
          <span>🎫</span>
          <span className="text-yellow-300 font-mono text-sm font-bold">{trimmed}</span>
        </div>
      );
      i++; continue;
    }

    // ── EMAIL ──
    if (trimmed.match(/^\S+@\S+\.\S+$/) || (trimmed.match(/\S+@\S+\.\S+/) && trimmed.length < 60)) {
      elements.push(
        <div key={`em-${k++}`} className="flex items-center gap-2 py-0.5">
          <span className="text-sm">✉️</span>
          <span className="text-blue-300 text-sm underline">{trimmed}</span>
        </div>
      );
      i++; continue;
    }

    // ── PHONE ──
    if (trimmed.match(/1-800|^\+?\d[\d\s\-().]{7,}$/)) {
      elements.push(
        <div key={`ph-${k++}`} className="flex items-center gap-2 py-0.5">
          <span className="text-sm">📞</span>
          <span className="text-green-300 text-sm">{trimmed}</span>
        </div>
      );
      i++; continue;
    }

    // ── PRICE HIGHLIGHT LINE ──
    if (trimmed.match(/\$\d+/) && trimmed.length < 80) {
      elements.push(
        <p key={`pr-${k++}`} className="text-sm leading-relaxed text-gray-100">
          {renderInline(trimmed)}
        </p>
      );
      i++; continue;
    }

    // ── REGULAR PARAGRAPH ──
    elements.push(
      <p key={`p-${k++}`} className="text-gray-100 text-sm leading-relaxed">
        {renderInline(trimmed)}
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5 w-full">{elements}</div>;
}

// ── Quick action chips ────────────────────────────────────────────
const quickQuestions = [
  { label: '📦 Track Order',     text: 'How do I track my order?' },
  { label: '🔄 Refund Request',  text: 'I want to request a refund' },
  { label: '🔧 Technical Issue', text: 'I am having a technical issue with my device' },
  { label: '💳 Billing Problem', text: 'I have a billing problem' },
  { label: '🛡️ Warranty',       text: 'How do I claim warranty for my product?' },
  { label: '💻 Compare Laptops', text: 'Show me a comparison chart of all laptops' },
];

// ── Page component ────────────────────────────────────────────────
export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions]   = useState<Session[]>([]);
  const [username, setUsername]   = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name  = localStorage.getItem('username');
    if (!token) { router.push('/login'); return; }
    setUsername(name || 'User');
    loadSessions();
    startNewSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessions = async () => {
    try { const d = await getSessions(); setSessions(d.sessions || []); } catch {}
  };

  const startNewSession = async () => {
    try {
      const data = await createSession();
      setSessionId(data.session_id);
      setMessages([{
        role: 'assistant',
        content: `## 👋 Welcome to TechMart AI Support!

I'm your intelligent support assistant. Here's what I can help you with:

**💳 Billing & Payments**
- Payment failures, invoice queries, subscription management

**🔧 Technical Support**
- Login issues, device troubleshooting, software errors

**📦 Product Information**
- Pricing, features, comparisons, availability

**🔄 Returns & Refunds**
- Return requests, refund status, exchange policy

**📋 General Questions**
- Policies, shipping, warranty, contact info

---
How can I assist you today?`
      }]);
      loadSessions();
    } catch {}
  };

  const loadSession = async (sid: string) => {
    setSessionId(sid);
    try { const d = await getChatHistory(sid); setMessages(d.messages || []); } catch {}
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const data = await sendMessage(userMsg, sessionId!);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        agents_used: data.agents_used
      }]);
    } catch {
      toast.error('Failed to get response. Please try again.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <Toaster position="top-right" />

      {/* ── SIDEBAR ─────────────────────────────── */}
      {sidebarOpen && (
        <div className="w-64 bg-gray-900 flex flex-col border-r border-gray-800 flex-shrink-0">
          <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-blue-950 to-gray-900">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">🛒</div>
              <div>
                <div className="text-sm font-bold text-white">TechMart AI</div>
                <div className="text-xs text-blue-400">Support Assistant</div>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-2">Hello, {username}! 👋</div>
          </div>

          <button onClick={startNewSession}
            className="mx-3 mt-3 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 rounded-lg px-3 py-2.5 text-sm font-medium transition">
            <Plus size={16} /> New Conversation
          </button>

          <div className="flex-1 overflow-y-auto p-3 space-y-1 mt-2">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-1 font-semibold">💬 History</div>
            {sessions.length === 0 && <div className="text-xs text-gray-600 px-2 italic">No conversations yet</div>}
            {sessions.map(s => (
              <button key={s.session_id} onClick={() => loadSession(s.session_id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition hover:bg-gray-800 ${sessionId === s.session_id ? 'bg-gray-800 border border-gray-700' : ''}`}>
                <div className="truncate text-gray-300 text-xs">💬 {s.session_id.slice(0, 8)}...</div>
                <div className="text-xs text-gray-600 mt-0.5">{new Date(s.created_at).toLocaleDateString()}</div>
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-gray-800 space-y-1">
            <button onClick={() => router.push('/analytics')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition flex items-center gap-2 text-gray-300">
              <BarChart2 size={16} className="text-purple-400" /> Analytics
            </button>
            <button onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition flex items-center gap-2 text-red-400">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN AREA ───────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition">
            <Menu size={20} />
          </button>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Bot size={16} />
          </div>
          <div>
            <div className="font-semibold text-sm">TechMart AI Support</div>
            <div className="text-xs text-gray-500">Multi-Agent • RAG Powered</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Zap size={12} className="text-yellow-400" />
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{ background: 'linear-gradient(180deg,#030712 0%,#0f172a 100%)' }}>

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                  <Bot size={14} />
                </div>
              )}

              <div className={msg.role === 'user' ? 'max-w-sm' : 'max-w-2xl w-full'}>
                {msg.role === 'assistant' ? (
                  <div className="bg-gray-800/90 border border-gray-700/50 rounded-2xl rounded-tl-none px-4 py-3 shadow-xl w-full">
                    {renderMessage(msg.content)}
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl rounded-tr-none px-4 py-3 shadow-lg">
                    <p className="text-white text-sm leading-relaxed">{msg.content}</p>
                  </div>
                )}

                {msg.agents_used && msg.agents_used.length > 0 && (
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {msg.agents_used.map(agent => {
                      const cfg = agentConfig[agent] || { bg: 'bg-gray-600', emoji: '🤖' };
                      return (
                        <span key={agent} className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} text-white font-medium`}>
                          {cfg.emoji} {agent}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <User size={14} />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                <Bot size={14} />
              </div>
              <div className="bg-gray-800 border border-gray-700/50 rounded-2xl rounded-tl-none px-4 py-3">
                <div className="flex gap-1 items-center">
                  <span className="text-xs text-gray-400 mr-1">AI is thinking</span>
                  {[0, 150, 300].map(d => (
                    <div key={d} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick chips */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto flex-shrink-0 bg-gray-900 border-t border-gray-800">
          {quickQuestions.map(q => (
            <button key={q.text} onClick={() => setInput(q.text)}
              className="flex-shrink-0 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-full px-3 py-1.5 transition whitespace-nowrap">
              {q.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 bg-gray-900 border-t border-gray-800 flex-shrink-0">
          <div className="flex gap-3 items-center">
            <input type="text" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask me anything about TechMart..."
              className="flex-1 bg-gray-800 border border-gray-700 focus:border-blue-500 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm placeholder-gray-500 transition" />
            <button onClick={handleSend} disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl px-4 py-3 transition flex items-center">
              <Send size={16} />
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center">
            Powered by Multi-Agent AI + RAG • TechMart Electronics
          </p>
        </div>
      </div>
    </div>
  );
}
