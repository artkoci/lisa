import React, { useState, useEffect } from 'react';
import VoiceVisualizer from '@/components/VoiceVisualizer';
import ChatHistory from '@/components/ChatHistory';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { useAudioVisualization } from '@/hooks/useAudioVisualization';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/sonner';
import { Sparkles, MessageSquare, X } from 'lucide-react';
const Index = () => {
  const {
    toast
  } = useToast();
  const [isMuted, setIsMuted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
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
        description: "The AI assistant won't be able to hear you"
      });
    } else {
      toast({
        title: "Microphone unmuted",
        description: "The AI assistant can now hear you"
      });
    }
  };

  // Handle start call with permissions check
  const handleStartCall = async () => {
    try {
      // Request microphone permission before starting call
      await navigator.mediaDevices.getUserMedia({
        audio: true
      });
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

  // Toggle chat history visibility
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // Close chat history
  const closeChat = () => {
    setIsChatOpen(false);
  };
  return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-black flex flex-col items-center justify-center p-6 transition-colors duration-700">
      <div className="max-w-5xl w-full mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
            <h1 className="text-4xl md:text-5xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-300 to-purple-500 font-extrabold">Reverse Lisa</h1>
            <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
          </div>
          <p className="mt-2 text-muted-foreground text-lg animate-fade-in">Welcome to the future</p>
        </header>
        
        <div className="relative w-full flex flex-col items-center justify-center">
          {/* Main voice visualizer - now centered and prominent */}
          <div className="flex flex-col items-center backdrop-blur-lg bg-black/30 p-10 rounded-3xl border border-purple-900/30 shadow-xl shadow-purple-900/20 hover:shadow-purple-800/20 transition-all duration-500 max-w-md w-full">
            <VoiceVisualizer audioData={audioData} isAgentSpeaking={isAgentSpeaking} isUserSpeaking={isUserSpeaking && !isMuted} callStatus={callStatus} onStartCall={handleStartCall} onEndCall={endCall} onStartSpeaking={handleStartSpeaking} onStopSpeaking={stopUserSpeaking} />
            
            <div className="mt-6 text-sm text-muted-foreground text-center">
              {callStatus === 'active' ? isMuted ? <span className="text-orange-400">Microphone is muted</span> : <span>
                    {isUserSpeaking ? "Listening to you..." : "Press the microphone button to speak"}
                  </span> : callStatus === 'idle' ? <span>Press the phone button to connect</span> : callStatus === 'connecting' ? <span>Establishing secure connection...</span> : <span>Call ended</span>}
            </div>
          </div>
          
          {/* Chat history toggle button */}
          <button onClick={toggleChat} className="fixed bottom-8 right-8 z-10 p-4 rounded-full bg-gradient-to-r from-purple-700 to-purple-900 text-white shadow-lg shadow-purple-900/30 hover:shadow-purple-800/40 transition-all duration-300 group" aria-label={isChatOpen ? "Close Chat" : "Open Chat"}>
            {isChatOpen ? <X className="w-6 h-6 group-hover:scale-110 transition-transform" /> : <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />}
          </button>
          
          {/* Collapsible chat history panel */}
          <div className={`fixed top-0 right-0 h-full w-full sm:w-96 transition-transform duration-500 ease-in-out z-50 transform ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="h-full w-full bg-black/80 backdrop-blur-xl shadow-2xl border-l border-purple-900/30">
              <ChatHistory messages={messages} onClose={closeChat} />
            </div>
          </div>
        </div>
      </div>
      
      <Toaster />
    </div>;
};
export default Index;