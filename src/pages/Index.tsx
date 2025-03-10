
import React, { useState, useEffect } from 'react';
import VoiceVisualizer from '@/components/VoiceVisualizer';
import ChatHistory from '@/components/ChatHistory';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { useAudioVisualization } from '@/hooks/useAudioVisualization';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/sonner';
import { Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 flex flex-col items-center justify-center p-6 transition-colors duration-700">
      <div className="max-w-4xl w-full mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 dark:from-purple-400 dark:via-pink-300 dark:to-purple-400">
              AI Voice Chat
            </h1>
            <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
          </div>
          <p className="mt-2 text-muted-foreground text-lg animate-fade-in">
            Experience natural conversations with our AI assistant
          </p>
        </header>
        
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="flex flex-col items-center backdrop-blur-lg bg-white/30 dark:bg-black/20 p-8 rounded-3xl border border-purple-100 dark:border-purple-900/30 shadow-xl hover:shadow-purple-200/20 dark:hover:shadow-purple-900/20 transition-all duration-500">
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
              <p className="text-sm text-muted-foreground/80 italic">
                Powered by advanced AI technology
              </p>
            </div>
          </div>
          
          <div className="w-full animate-fade-in backdrop-blur-lg bg-white/30 dark:bg-black/20 rounded-3xl border border-purple-100 dark:border-purple-900/30 shadow-xl hover:shadow-purple-200/20 dark:hover:shadow-purple-900/20 transition-all duration-500">
            <ChatHistory messages={messages} />
          </div>
        </div>
      </div>
      
      <Toaster />
    </div>
  );
};

export default Index;
