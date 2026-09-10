import React, { useState } from 'react';
import { StudentOverallStats } from '../../types.ts';
import { Bot, Send, User, Sparkles } from 'lucide-react';

interface AttendanceAssistantViewProps {
  stats: StudentOverallStats;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AttendanceAssistantView: React.FC<AttendanceAssistantViewProps> = ({ stats }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello ${stats.studentName}! I am your Personal Attendance & Academic Risk Assistant. You can ask me any question regarding your current percentages, buffer calculations, safe absences, or recovery plans.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryToSend?: string) => {
    const query = (queryToSend || input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/student/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: stats.studentId,
          query,
        }),
      });

      const data = await res.json();
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'I could not process your query at this moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: 'There was a connection error contacting the attendance intelligence engine.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'What is my overall attendance status?',
    'Can I miss tomorrow’s lecture?',
    'How many consecutive classes do I need to attend to reach 80%?',
    'Which subject has my lowest attendance?',
    'What is my safe attendance buffer?',
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 shrink-0">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900">
            Personal Attendance Assistant
          </h1>
          <p className="text-xs text-slate-500">
            Rule-based mathematical intelligence answering questions about risk, recovery, and buffers
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col h-[500px]">
        {/* Messages list */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${
                m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-indigo-100 text-indigo-800'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div>
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block px-1">
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 text-xs text-slate-500 rounded-tl-none flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* Suggested Queries */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-1.5">
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-[11px] bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-medium transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-indigo-500" />
              {prompt}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-slate-200 flex gap-2"
        >
          <input
            id="assistant-query-input"
            type="text"
            placeholder="Ask about your attendance, subjects, or safe absence limits..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            id="assistant-send-button"
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" /> Send
          </button>
        </form>
      </div>
    </div>
  );
};
