import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, AlertTriangle, RefreshCw, MessageSquare } from 'lucide-react';

export default function AIChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Xin chào! Tôi là Trợ lý AI Cinema. 🤖✨\n\nHiện tại tính năng Chatbot AI đang trong quá trình BẢO TRÌ & NÂNG CẤP HỆ THỐNG để nâng cao chất lượng phản hồi.\n\nRất tiếc chưa thể hỗ trợ trực tiếp cho bạn lúc này. Vui lòng quay lại sau hoặc liên hệ Hotline để được hỗ trợ tức thì!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg.trim();
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMsg('');
    setIsTyping(true);

    // Simulate delayed response with maintenance notice
    setTimeout(() => {
      setIsTyping(false);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: '⚙️ Thông báo hệ thống: Tính năng Chatbot AI đang bảo trì kết nối. Vui lòng thử lại sau!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMaintenanceWarning: true,
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <>
      {/* ── FLOATING TOGGLE BUTTON (BOTTOM RIGHT) ── */}
      <div className="fixed bottom-6 right-6 z-[9990] flex items-center gap-2 select-none">
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-white/10 text-xs text-zinc-300 shadow-xl backdrop-blur-md animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>AI Assistant (Bảo trì)</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-13 h-13 rounded-full bg-gradient-to-tr from-[#CF0F47] to-[#005bab] text-white flex items-center justify-center shadow-2xl shadow-rose-950/60 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-white/20 group"
          aria-label="Mở AI Assistant"
        >
          <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          {isOpen ? (
            <X className="w-6 h-6 text-white transition-transform duration-300 rotate-90" />
          ) : (
            <div className="relative">
              <Bot className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-12" />
              <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1 -right-1.5 animate-pulse" />
            </div>
          )}
        </button>
      </div>

      {/* ── CHATBOT POPUP WINDOW ── */}
      {isOpen && (
        <div className="fixed bottom-22 right-6 z-[9999] w-[360px] sm:w-[380px] max-w-[calc(100vw-2rem)] h-[480px] max-h-[calc(100vh-7rem)] rounded-2xl bg-[#141417] border border-white/12 shadow-2xl flex flex-col overflow-hidden animate-scale-up font-sans select-none">
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-zinc-900 via-[#1a1420] to-zinc-900 border-b border-white/8 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#CF0F47] to-[#005bab] p-0.5 shadow-md flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-rose-400" />
                </div>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs text-white tracking-wide">Cinema AI Assistant</h4>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-400/90 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Đang bảo trì kết nối
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Maintenance Notification Banner */}
          <div className="px-3.5 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-[11px] font-medium flex items-center gap-2 text-left shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Hệ thống AI đang bảo trì. Vui lòng quay lại sau!</span>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 custom-scrollbar text-left bg-zinc-950/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-rose-400" />
                  </div>
                )}

                <div className={`max-w-[82%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#CF0F47] text-white rounded-tr-none'
                    : msg.isMaintenanceWarning
                    ? 'bg-amber-500/15 border border-amber-500/30 text-amber-200 rounded-tl-none font-medium'
                    : 'bg-zinc-900 border border-white/8 text-zinc-200 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span className={`text-[9px] mt-1 block text-right ${
                    msg.sender === 'user' ? 'text-rose-200' : 'text-zinc-500'
                  }`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-rose-400" />
                </div>
                <div className="bg-zinc-900 border border-white/8 rounded-xl px-3.5 py-2 text-xs text-zinc-400 flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin text-rose-400" />
                  <span>AI đang soạn phản hồi...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-zinc-900/90 border-t border-white/8 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Hỏi AI (Đang bảo trì)..."
              className="flex-1 h-9 px-3 bg-zinc-950 border border-white/10 text-white rounded-xl text-xs placeholder:text-zinc-500 focus:outline-hidden focus:border-rose-500/60 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim()}
              className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#CF0F47] to-[#a00c3a] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 transition-opacity cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
