
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { askManruraAssistant } from '../services/geminiService';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, XMarkIcon } from './Icons';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    if(isOpen && messages.length === 0){
        setMessages([{ role: 'bot', text: "Hello! I am the MANRURA Assistant. How can I help you understand the ward management standards today?"}]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const botResponse = await askManruraAssistant(userMessage.text);
      const botMessage: ChatMessage = { role: 'bot', text: botResponse };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Gemini API error:', error);
      const errorMessage: ChatMessage = { role: 'bot', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-sky-600 text-white rounded-full p-3 shadow-lg hover:bg-sky-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
        aria-label="Toggle Chat"
      >
        {isOpen ? <XMarkIcon className="w-8 h-8"/> : <ChatBubbleLeftRightIcon className="w-8 h-8" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] bg-white rounded-lg shadow-2xl flex flex-col border border-slate-200">
          <header className="bg-slate-800 text-white p-4 rounded-t-lg flex items-center">
            <h3 className="text-lg font-semibold">MANRURA Assistant</h3>
          </header>
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
            <div className="space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${msg.role === 'user' ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-800'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-200 text-slate-800 px-4 py-2 rounded-xl flex items-center space-x-1">
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
          </div>
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 flex items-center bg-white rounded-b-lg">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about MANRURA..."
              className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="ml-3 p-3 bg-sky-600 text-white rounded-full disabled:bg-slate-400 hover:bg-sky-700 transition-colors"
              disabled={isLoading || !input.trim()}
              aria-label="Send Message"
            >
              <PaperAirplaneIcon className="w-5 h-5"/>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
