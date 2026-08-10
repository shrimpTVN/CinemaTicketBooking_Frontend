import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, RefreshCw, Trash2 } from 'lucide-react';
import { sendChatMessage, clearChatHistory } from '../services/chatbotService';

export default function AIChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [conversationId, setConversationId] = useState(() => 'conv_' + Math.random().toString(36).substring(2, 10));
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Xin chào! Tôi là Trợ lý AI Cinema. 🤖✨\n\nTôi có thể giúp bạn tra cứu phim đang chiếu, lịch chiếu rạp, khuyến mãi, bắp nước và bảng giá vé. Bạn muốn tìm thông tin gì ạ?',
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
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || isTyping) return;

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

    try {
      const res = await sendChatMessage(userText, conversationId);
      setIsTyping(false);

      const botReply = res?.reply || 'Rất tiếc, AI chưa tạo được câu trả lời phù hợp.';
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Error getting AI response:', err);
      setIsTyping(false);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: '⚠️ Không thể kết nối với AI Server. Vui lòng kiểm tra lại cấu hình GEMINI_API_KEY ở Backend hoặc thử lại sau ít phút!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleClearHistory = async () => {
    await clearChatHistory(conversationId);
    const newId = 'conv_' + Math.random().toString(36).substring(2, 10);
    setConversationId(newId);
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: 'Đã làm mới cuộc hội thoại! Tôi có thể giúp gì thêm cho bạn?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* ── FLOATING TOGGLE BUTTON (BOTTOM RIGHT) ── */}
      <div className="fixed bottom-6 right-6 z-[9990] flex items-center gap-2 select-none">
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-white/10 text-xs text-zinc-300 shadow-xl backdrop-blur-md animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI Assistant 24/7</span>
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
        <div className="fixed bottom-22 right-6 z-[9999] w-[360px] sm:w-[400px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-7rem)] rounded-2xl bg-[#141417] border border-white/12 shadow-2xl flex flex-col overflow-hidden animate-scale-up font-sans select-none">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-zinc-900 via-[#1a1420] to-zinc-900 border-b border-white/8 flex items-center justify-between shrink-0">
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
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sẵn sàng hỗ trợ 24/7
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                title="Làm mới cuộc trò chuyện"
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
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

                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#CF0F47] text-white rounded-tr-none shadow-md'
                      : msg.isError
                      ? 'bg-amber-500/15 border border-amber-500/30 text-amber-200 rounded-tl-none font-medium'
                      : 'bg-zinc-900 border border-white/8 text-zinc-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span
                    className={`text-[9px] mt-1 block text-right ${
                      msg.sender === 'user' ? 'text-rose-200' : 'text-zinc-500'
                    }`}
                  >
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
                <div className="bg-zinc-900 border border-white/8 rounded-xl px-3.5 py-2 text-xs text-zinc-400 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400" />
                  <span>AI đang truy vấn dữ liệu & soạn phản hồi...</span>
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
              placeholder="Nhập câu hỏi tra cứu phim, lịch chiếu, giá vé..."
              className="flex-1 h-9.5 px-3.5 bg-zinc-950 border border-white/10 text-white rounded-xl text-xs placeholder:text-zinc-500 focus:outline-hidden focus:border-rose-500/60 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim() || isTyping}
              className="w-9.5 h-9.5 rounded-xl bg-gradient-to-r from-[#CF0F47] to-[#a00c3a] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 transition-opacity cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
