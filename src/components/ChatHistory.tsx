
import React, { useRef, useEffect } from 'react';
import { Message } from '@/types';
import { ArrowLeft } from 'lucide-react';

interface ChatHistoryProps {
  messages: Message[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-purple-900/30 bg-black/30">
        <h2 className="text-lg font-medium text-purple-100">Conversation History</h2>
      </div>
      
      <div 
        ref={chatContainerRef}
        className="p-4 flex-1 overflow-y-auto flex flex-col space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-center">
              Your conversation will appear here.
              <br />
              Start by connecting to the agent.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              <div 
                className={`
                  max-w-[80%] rounded-2xl px-4 py-3 shadow-sm transition-all duration-300 hover:shadow-md
                  ${message.sender === 'user' 
                    ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-tr-none' 
                    : 'bg-black/50 backdrop-blur-sm text-purple-100 rounded-tl-none border border-purple-900/30'
                  }
                `}
              >
                <div className="flex flex-col">
                  <span className="text-sm">{message.text}</span>
                  <span className={`text-xs mt-1 ${message.sender === 'user' ? 'text-purple-200/70' : 'text-purple-400/70'}`}>
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
