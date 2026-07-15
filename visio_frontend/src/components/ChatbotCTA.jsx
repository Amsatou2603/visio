import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import api from '../services/api';

const ChatbotCTA = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Bonjour ! Je suis **VisioBot**, l\'assistant virtuel de Visio. Comment puis-je vous aider aujourd\'hui ?',
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input on open
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    if (!textToSend) {
      setInput('');
    }

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      time: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Build history for backend (excluding welcome message)
      const history = messages
        .filter((msg) => msg.id !== 'welcome')
        .map((msg) => ({
          role: msg.sender === 'bot' ? 'model' : 'user',
          text: msg.text,
        }));

      // Call chatbot API
      const response = await api.post('/chatbot/ask/', {
        message: text,
        history,
      });

      // Add bot response
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: response.data.reply || 'Désolé, je n\'ai pas pu traiter votre demande.',
          time: new Date(),
        },
      ]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: 'Désolé, je rencontre des difficultés de connexion. Vous pouvez également nous contacter directement sur WhatsApp !',
          time: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick suggestion chips
  const suggestions = [
    { label: '🛍️ Nos produits', text: 'Quels produits proposez-vous sur Visio ?' },
    { label: '📦 Comment commander ?', text: 'Comment passer une commande ?' },
    { label: '💰 Modes de paiement', text: 'Quels sont les modes de paiement acceptés ?' },
    { label: '🤝 Devenir Vendeur', text: 'Comment puis-je vendre mes produits sur Visio ?' },
  ];

  // Basic markdown-like formatter for bold and lists
  const formatMessageText = (text) => {
    if (!text) return '';

    // Escape HTML to prevent XSS since we use dangerouslySetInnerHTML
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Format bold (**text**)
    let formatted = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Format italic (*text*)
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Format inline code/tags
    formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded font-mono text-sm">$1</code>');

    // Format lists (- item or * item)
    const lines = formatted.split('\n');
    const processedLines = lines.map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return `<li class="ml-4 list-disc">${trimmed.substring(2)}</li>`;
      }
      return line;
    });

    return processedLines.join('<br />');
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[999] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110"
        style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          boxShadow: 'var(--shadow-red)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        title="Discutez avec VisioBot"
      >
        {isOpen ? (
          <X className="w-6 h-6 transition-transform duration-300 rotate-90" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6 transition-transform duration-300 hover:rotate-12" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed z-[998] right-6 bottom-24 w-[380px] max-w-[calc(100vw-32px)] h-[540px] max-h-[calc(100vh-120px)] flex flex-col rounded-2xl overflow-hidden transition-all duration-300 transform shadow-2xl border border-gray-200 dark:border-gray-800 ${
          isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-90 pointer-events-none'
        }`}
        style={{
          background: 'var(--surface)',
          backdropFilter: 'blur(20px)',
          boxShadow: 'var(--glass-shadow)',
        }}
      >
        {/* Header */}
        <div
          className="p-4 flex items-center justify-between text-white"
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 relative">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-red-500 animate-pulse"></span>
            </div>
            <div>
              <h3 className="font-semibold text-[15px] leading-tight flex items-center gap-1.5">
                VisioBot <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              </h3>
              <p className="text-xs text-white/80 font-light">En ligne • Assistant virtuel</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              {msg.sender === 'bot' ? (
                <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-700">
                  <Bot className="w-4 h-4 text-[var(--primary)]" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-[var(--primary-subtle)] flex items-center justify-center shrink-0 border border-[var(--primary-glow)]">
                  <User className="w-4 h-4 text-[var(--primary)]" />
                </div>
              )}

              <div className="space-y-1">
                <div
                  className={`p-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[var(--primary)] text-white rounded-tr-none'
                      : 'bg-white dark:bg-gray-800/90 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700/60'
                  }`}
                  dangerouslySetInnerHTML={{ __html: formatMessageText(msg.text) }}
                />
                <span
                  className={`text-[10px] text-gray-400 dark:text-gray-500 block px-1 ${
                    msg.sender === 'user' ? 'text-right' : ''
                  }`}
                >
                  {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-2.5 max-w-[80%]">
              <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-700">
                <Bot className="w-4 h-4 text-[var(--primary)]" />
              </div>
              <div className="bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700/60 p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length === 1 && !isLoading && (
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800/50 flex flex-wrap gap-2 bg-gray-50/50 dark:bg-gray-900/10">
            {suggestions.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.text)}
                className="text-xs px-2.5 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 hover:border-[var(--primary)] hover:text-[var(--primary)] bg-white dark:bg-gray-800/60 transition-all duration-200 text-left hover:scale-[1.02]"
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* Input form */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/20">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl px-3 py-1.5 border border-gray-200 dark:border-gray-700 focus-within:border-[var(--primary)] focus-within:ring-1 focus-within:ring-[var(--primary-glow)] transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Écrivez un message..."
              rows={1}
              className="flex-1 bg-transparent border-0 outline-none text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none max-h-20"
              style={{ caretColor: 'var(--primary)' }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className="p-1.5 rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--primary-dark)] transition-colors shrink-0"
              style={{
                backgroundColor: input.trim() ? 'var(--primary)' : 'transparent',
                color: input.trim() ? '#fff' : 'var(--text-muted)',
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatbotCTA;
