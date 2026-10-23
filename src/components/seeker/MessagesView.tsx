import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Send, Video, ShieldCheck, CheckCheck, Paperclip } from 'lucide-react';

interface ChatThread {
  id: string;
  recruiterName: string;
  companyName: string;
  roleTitle: string;
  avatarUrl?: string;
  unread: boolean;
  messages: {
    id: string;
    sender: 'recruiter' | 'candidate';
    text: string;
    timestamp: string;
    actionLink?: { label: string; url: string };
  }[];
}

const INITIAL_THREADS: ChatThread[] = [
  {
    id: 'thread_google',
    recruiterName: 'Priya Sundaram',
    companyName: 'Google India',
    roleTitle: 'Software Engineer II (Full Stack)',
    unread: true,
    messages: [
      {
        id: 'm1',
        sender: 'recruiter',
        text: 'Hi Aarav, our engineering team reviewed your DevPulse real-time project and was impressed with the Redis latency architecture!',
        timestamp: '10:15 AM',
      },
      {
        id: 'm2',
        sender: 'recruiter',
        text: 'We would love to invite you for a 45-minute technical discussion focusing on distributed web clients and TypeScript.',
        timestamp: '10:16 AM',
        actionLink: { label: 'Join Google Meet Interview', url: 'https://meet.google.com/abc-defg-hij' },
      },
    ],
  },
  {
    id: 'thread_razorpay',
    recruiterName: 'Vikram Mehta',
    companyName: 'Razorpay',
    roleTitle: 'Product Engineer - Payments Gateway',
    unread: false,
    messages: [
      {
        id: 'm3',
        sender: 'recruiter',
        text: 'Hey Aarav! We saw your application for the Payments Gateway team. Are you available for a quick screening sync this Friday?',
        timestamp: 'Yesterday',
      },
      {
        id: 'm4',
        sender: 'candidate',
        text: 'Hello Vikram, yes! Friday anytime after 2 PM works great for me. Looking forward to it.',
        timestamp: 'Yesterday',
      },
    ],
  },
];

export const MessagesView: React.FC = () => {
  const { user } = useApp();
  const [threads, setThreads] = useState<ChatThread[]>(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string>(INITIAL_THREADS[0].id);
  const [inputText, setInputText] = useState<string>('');

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: `m_${Date.now()}`,
      sender: 'candidate' as const,
      text: inputText.trim(),
      timestamp: 'Just now',
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id
          ? { ...t, messages: [...t.messages, newMsg] }
          : t
      )
    );
    setInputText('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden text-neutral-100">
      {/* Thread list strip (horizontal on mobile) */}
      <div className="flex gap-2 p-3 bg-neutral-950 border-b border-neutral-800 shrink-0 overflow-x-auto no-scrollbar">
        {threads.map((t) => {
          const isActive = t.id === activeThread.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveThreadId(t.id)}
              className={`p-2 rounded-xl text-left border shrink-0 transition-all ${
                isActive
                  ? 'bg-neutral-900 border-blue-500/50'
                  : 'bg-neutral-900/50 border-neutral-800 opacity-70'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate max-w-[110px]">
                  {t.recruiterName}
                </span>
                <ShieldCheck className="w-3 h-3 text-blue-400 shrink-0" />
              </div>
              <span className="text-[10px] text-neutral-400 block truncate max-w-[130px]">
                {t.companyName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Current Chat Header */}
      <div className="px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between shrink-0">
        <div>
          <h4 className="text-xs font-bold text-white flex items-center gap-1">
            {activeThread.recruiterName}
            <span className="text-[10px] text-neutral-500 font-normal">({activeThread.companyName})</span>
          </h4>
          <p className="text-[10px] text-neutral-400 truncate">{activeThread.roleTitle}</p>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar pb-24">
        {activeThread.messages.map((msg) => {
          const isCandidate = msg.sender === 'candidate';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isCandidate ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                  isCandidate
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-bl-xs'
                }`}
              >
                <p>{msg.text}</p>
                {msg.actionLink && (
                  <a
                    href={msg.actionLink.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-[11px] transition-colors"
                  >
                    <Video className="w-3 h-3" />
                    {msg.actionLink.label}
                  </a>
                )}
              </div>
              <span className="text-[9px] font-mono text-neutral-500 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          );
        })}
      </div>

      {/* Input bar pinned at bottom */}
      <div className="p-3 bg-neutral-950 border-t border-neutral-800 absolute bottom-6 left-0 right-0 z-30">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Reply to ${activeThread.recruiterName}...`}
            className="flex-1 px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
