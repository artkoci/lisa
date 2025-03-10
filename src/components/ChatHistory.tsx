
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
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border shadow-sm overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-border bg-secondary/50">
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
                  max-w-[80%] rounded-2xl px-4 py-3 shadow-sm
                  ${message.sender === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-none' 
                    : 'bg-secondary text-secondary-foreground rounded-tl-none border border-border'
                  }
                `}
              >
                <div className="flex flex-col">
                  <span className="text-sm">{message.text}</span>
                  <span className={`text-xs mt-1 ${message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
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
