
import React, { useState, useEffect } from 'react';
import VoiceVisualizer from '@/components/VoiceVisualizer';
import ChatHistory from '@/components/ChatHistory';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { useAudioVisualization } from '@/hooks/useAudioVisualization';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/sonner';

const Index = () => {
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(false);
  
  const {
    messages,
    callStatus,
    isAgentSpeaking,
    isUserSpeaking,
    startCall,
    endCall,
    sendUserMessage,
    startUserSpeaking,
    stopUserSpeaking
  } = useVoiceChat();
  
  const {
    audioData,
    isMicrophoneActive,
    startUserAudio,
    stopUserAudio,
    startAgentAudio,
    stopAgentAudio
  } = useAudioVisualization(callStatus === 'active');
  
  // Handle agent speaking state changes
  useEffect(() => {
    if (isAgentSpeaking) {
      startAgentAudio();
    } else {
      stopAgentAudio();
    }
  }, [isAgentSpeaking]);
  
  // Handle user speaking state changes
  useEffect(() => {
    if (isUserSpeaking) {
      startUserAudio();
    } else {
      stopUserAudio();
    }
  }, [isUserSpeaking]);
  
  // Handle muted state
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    
    if (!isMuted) {
      toast({
        title: "Microphone muted",
        description: "The AI assistant won't be able to hear you",
      });
    } else {
      toast({
        title: "Microphone unmuted",
        description: "The AI assistant can now hear you",
      });
    }
  };
  
  // Handle start call with permissions check
  const handleStartCall = async () => {
    try {
      // Request microphone permission before starting call
      await navigator.mediaDevices.getUserMedia({ audio: true });
      startCall();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use the voice chat",
        variant: "destructive"
      });
    }
  };
  
  // Handle user speaking with mute check
  const handleStartSpeaking = () => {
    if (isMuted) {
      toast({
        title: "Microphone is muted",
        description: "Please unmute your microphone to speak",
        variant: "destructive"
      });
      return;
    }
    
    startUserSpeaking();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-700 dark:from-primary dark:to-blue-400">
            AI-Powered Call Center
          </h1>
          <p className="mt-2 text-muted-foreground">
            Speak naturally with our AI assistant to get help with your questions
          </p>
        </header>
        
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="flex flex-col items-center">
            <VoiceVisualizer 
              audioData={audioData}
              isAgentSpeaking={isAgentSpeaking}
              isUserSpeaking={isUserSpeaking && !isMuted}
              callStatus={callStatus}
              onStartCall={handleStartCall}
              onEndCall={endCall}
              onStartSpeaking={handleStartSpeaking}
              onStopSpeaking={stopUserSpeaking}
            />
            
            <div className="mt-6 text-sm text-muted-foreground text-center">
              {callStatus === 'active' ? (
                isMuted ? (
                  <span className="text-orange-500 dark:text-orange-400">Microphone is muted</span>
                ) : (
                  <span>
                    {isUserSpeaking ? "Listening to you..." : "Press the microphone button to speak"}
                  </span>
                )
              ) : callStatus === 'idle' ? (
                <span>Press the phone button to connect</span>
              ) : callStatus === 'connecting' ? (
                <span>Establishing secure connection...</span>
              ) : (
                <span>Call ended</span>
              )}
            </div>
            
            <div className="text-center mt-10">
              <p className="text-sm text-muted-foreground">
                This interface connects to a Python FastAPI backend for AI-powered voice processing.
              </p>
            </div>
          </div>
          
          <div className="w-full">
            <ChatHistory messages={messages} />
          </div>
        </div>
      </div>
      
      <Toaster />
    </div>
  );
};

export default Index;
