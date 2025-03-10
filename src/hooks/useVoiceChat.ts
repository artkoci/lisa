
import { useState, useEffect, useCallback } from 'react';
import { Message, CallStatus, ApiConfig } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

// Default configuration
const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: 'http://localhost:8000',
};

export const useVoiceChat = (apiConfig: Partial<ApiConfig> = {}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const { toast } = useToast();
  
  // Merge default config with provided config
  const config = { ...DEFAULT_API_CONFIG, ...apiConfig };

  // Initialize conversation
  useEffect(() => {
    // In a real implementation, this would connect to the FastAPI backend
    // For now, we'll simulate the connection process
    
    const simulateInitialConnection = () => {
      // Add welcome message for demonstration
      const welcomeMessage: Message = {
        id: uuidv4(),
        text: "Welcome to our AI-powered call center. How can I assist you today?",
        sender: 'agent',
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
      setIsAgentSpeaking(true);
      
      // Simulate agent speaking for 4 seconds
      setTimeout(() => {
        setIsAgentSpeaking(false);
      }, 4000);
    };
    
    simulateInitialConnection();
  }, []);

  // Function to start a call
  const startCall = useCallback(() => {
    setCallStatus('connecting');
    
    // Simulate connection delay
    setTimeout(() => {
      setCallStatus('active');
      toast({
        title: "Call connected",
        description: "You're now connected to our AI assistant",
      });
    }, 1500);
  }, [toast]);

  // Function to end a call
  const endCall = useCallback(() => {
    setCallStatus('disconnected');
    setIsAgentSpeaking(false);
    setIsUserSpeaking(false);
    
    toast({
      title: "Call ended",
      description: "Your call has been disconnected",
    });
    
    // Reset to idle after a delay
    setTimeout(() => {
      setCallStatus('idle');
    }, 2000);
  }, [toast]);

  // Function to send a user message
  const sendUserMessage = useCallback((text: string) => {
    const userMessage: Message = {
      id: uuidv4(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsUserSpeaking(false);
    
    // In a real implementation, this would send the message to the FastAPI backend
    // and receive a response. For now, we'll simulate a response
    
    setCallStatus('active');
    
    // Simulate agent thinking
    setTimeout(() => {
      setIsAgentSpeaking(true);
      
      // Simulate agent response after a delay
      setTimeout(() => {
        // Sample responses - in a real implementation, these would come from the API
        const responses = [
          "I understand your concern. Let me help you with that.",
          "Thanks for providing that information. Is there anything else you'd like to know?",
          "I'm checking our system for that information. One moment please.",
          "That's a great question. Here's what I can tell you.",
          "I'd be happy to assist with your request."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const agentMessage: Message = {
          id: uuidv4(),
          text: randomResponse,
          sender: 'agent',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, agentMessage]);
        
        // Simulate agent speaking for a few seconds
        setTimeout(() => {
          setIsAgentSpeaking(false);
        }, 3000);
      }, 1000);
    }, 1500);
  }, []);

  // Function to handle user speaking state
  const startUserSpeaking = useCallback(() => {
    setIsUserSpeaking(true);
    setIsAgentSpeaking(false);
  }, []);

  // Function to handle user stopping speaking
  const stopUserSpeaking = useCallback(() => {
    setIsUserSpeaking(false);
    
    // In a real implementation, this would send the audio to the FastAPI backend
    // For demonstration, we'll simulate this with a text message
    sendUserMessage("This is a simulated user message from voice input.");
  }, [sendUserMessage]);

  return {
    messages,
    callStatus,
    isAgentSpeaking,
    isUserSpeaking,
    startCall,
    endCall,
    sendUserMessage,
    startUserSpeaking,
    stopUserSpeaking
  };
};
