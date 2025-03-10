
import { useState, useEffect, useCallback, useRef } from 'react';
import { Message, CallStatus, ApiConfig } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { playConnectSound, playDisconnectSound } from '@/utils/sounds';

// Default configuration
const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: 'http://localhost:8000',
};

export const useVoiceChat = (apiConfig: Partial<ApiConfig> = {}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  // WebSocket reference
  const wsRef = useRef<WebSocket | null>(null);
  
  // Audio recorder reference
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Merge default config with provided config
  const config = { ...DEFAULT_API_CONFIG, ...apiConfig };

  // Initialize WebSocket connection
  const initializeWebSocket = useCallback(() => {
    const wsUrl = `${config.baseUrl.replace('http', 'ws')}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('WebSocket connection established');
      setCallStatus('active');
      
      toast({
        title: "Call connected",
        description: "You're now connected to our AI assistant",
      });
      
      // Send initial message to start the conversation
      ws.send(JSON.stringify({
        type: 'init',
        session_id: uuidv4(),
      }));
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
      if (callStatus !== 'disconnected') {
        setCallStatus('disconnected');
        toast({
          title: "Connection lost",
          description: "The call was disconnected",
          variant: "destructive"
        });
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setCallStatus('error');
      toast({
        title: "Connection error",
        description: "Failed to connect to the voice service",
        variant: "destructive"
      });
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'agent_message') {
          // Add agent message to chat
          const agentMessage: Message = {
            id: uuidv4(),
            text: data.text,
            sender: 'agent',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, agentMessage]);
          
          // Set agent speaking state
          setIsAgentSpeaking(true);
          
          // When using text-to-speech, the agent will speak for a while
          // In a real implementation, we'd use the audio duration to determine when to stop
          // For now, we'll set a timeout based on text length
          const speakingDuration = Math.max(2000, data.text.length * 80);
          setTimeout(() => {
            setIsAgentSpeaking(false);
          }, speakingDuration);
        }
        else if (data.type === 'transcription') {
          // Add user message from transcription
          const userMessage: Message = {
            id: uuidv4(),
            text: data.text,
            sender: 'user',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, userMessage]);
          setIsProcessing(true);
          
          // After receiving transcription, the agent will process and respond
          setTimeout(() => {
            setIsProcessing(false);
          }, 1500);
        }
        else if (data.type === 'error') {
          console.error('Server error:', data.message);
          toast({
            title: "Error",
            description: data.message || "An error occurred",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
  }, [config.baseUrl, toast, callStatus]);

  // Function to start a call
  const startCall = useCallback(() => {
    if (callStatus === 'active' || callStatus === 'connecting') {
      console.log('Call already in progress');
      return;
    }
    
    setCallStatus('connecting');
    playConnectSound();
    
    // Initialize WebSocket connection
    initializeWebSocket();
    
    // Add welcome message
    setTimeout(() => {
      if (wsRef.current?.readyState !== WebSocket.OPEN) {
        // If WebSocket is not open after timeout, show error
        setCallStatus('error');
        toast({
          title: "Connection failed",
          description: "Could not connect to the voice service",
          variant: "destructive"
        });
      }
    }, 5000);
  }, [callStatus, initializeWebSocket, toast]);

  // Function to end a call
  const endCall = useCallback(() => {
    // Stop any recording in progress
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    // Close WebSocket connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setCallStatus('disconnected');
    setIsAgentSpeaking(false);
    setIsUserSpeaking(false);
    playDisconnectSound();
    
    toast({
      title: "Call ended",
      description: "Your call has been disconnected",
    });
    
    // Reset to idle after a delay
    setTimeout(() => {
      setCallStatus('idle');
    }, 2000);
  }, [toast]);

  // Function to send a user message via text
  const sendUserMessage = useCallback((text: string) => {
    if (!text.trim() || callStatus !== 'active' || !wsRef.current) {
      return;
    }
    
    const userMessage: Message = {
      id: uuidv4(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Send message to server
    wsRef.current.send(JSON.stringify({
      type: 'message',
      text: text
    }));
    
    setIsProcessing(true);
  }, [callStatus]);

  // Function to start recording user audio
  const startUserSpeaking = useCallback(async () => {
    if (callStatus !== 'active' || isUserSpeaking || !wsRef.current) {
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length === 0 || !wsRef.current) {
          setIsUserSpeaking(false);
          return;
        }
        
        try {
          // Create audio blob
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Reset chunks for next recording
          audioChunksRef.current = [];
          
          // Send audio to server via WebSocket
          wsRef.current.send(audioBlob);
          
          setIsUserSpeaking(false);
          setIsProcessing(true);
        } catch (error) {
          console.error('Error processing audio:', error);
          setIsUserSpeaking(false);
          toast({
            title: "Error processing speech",
            description: "Could not process your speech",
            variant: "destructive"
          });
        }
      };
      
      // Start recording
      mediaRecorder.start();
      setIsUserSpeaking(true);
      setIsAgentSpeaking(false);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsUserSpeaking(false);
      toast({
        title: "Microphone access failed",
        description: "Could not access your microphone",
        variant: "destructive"
      });
    }
  }, [callStatus, isUserSpeaking, toast]);

  // Function to stop recording user audio
  const stopUserSpeaking = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      
      // Stop all tracks on the stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    messages,
    callStatus,
    isAgentSpeaking,
    isUserSpeaking,
    isProcessing,
    startCall,
    endCall,
    sendUserMessage,
    startUserSpeaking,
    stopUserSpeaking
  };
};
