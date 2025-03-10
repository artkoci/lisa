
import React, { useRef, useEffect } from 'react';
import { Message } from '@/types';

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
    <div className="overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-purple-100 dark:border-purple-900/30 bg-white/30 dark:bg-black/30">
        <h2 className="text-lg font-medium">Conversation History</h2>
      </div>
      
      <div 
        ref={chatContainerRef}
        className="p-4 h-[400px] overflow-y-auto flex flex-col space-y-4"
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
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-tr-none' 
                    : 'bg-white/50 dark:bg-white/10 backdrop-blur-sm text-foreground rounded-tl-none border border-purple-100 dark:border-purple-900/30'
                  }
                `}
              >
                <div className="flex flex-col">
                  <span className="text-sm">{message.text}</span>
                  <span className={`text-xs mt-1 ${message.sender === 'user' ? 'text-purple-100' : 'text-muted-foreground'}`}>
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
