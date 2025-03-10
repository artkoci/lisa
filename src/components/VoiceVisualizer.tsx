
import React, { useMemo } from 'react';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { AudioAnalysisData, CallStatus } from '@/types';

interface VoiceVisualizerProps {
  audioData: AudioAnalysisData | null;
  isAgentSpeaking: boolean;
  isUserSpeaking: boolean;
  callStatus: CallStatus;
  onStartCall: () => void;
  onEndCall: () => void;
  onStartSpeaking: () => void;
  onStopSpeaking: () => void;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  audioData,
  isAgentSpeaking,
  isUserSpeaking,
  callStatus,
  onStartCall,
  onEndCall,
  onStartSpeaking,
  onStopSpeaking
}) => {
  // Calculate animation state based on audio data and speaking state
  const audioLines = useMemo(() => {
    const lines = [];
    const numberOfLines = 10;
    
    if (audioData && (isAgentSpeaking || isUserSpeaking)) {
      for (let i = 0; i < numberOfLines; i++) {
        const frequencyIndex = Math.floor(i * (audioData.frequencyData.length / numberOfLines));
        const value = audioData.frequencyData[frequencyIndex] / 255;
        
        lines.push(
          <div 
            key={i} 
            className="audio-line" 
            style={{ 
              height: `${16 + value * 40}px`, 
              opacity: 0.2 + value * 0.8,
            }}
          />
        );
      }
    } else {
      // Static lines when not speaking
      for (let i = 0; i < numberOfLines; i++) {
        lines.push(
          <div 
            key={i} 
            className="audio-line" 
            style={{ 
              height: '10px', 
              opacity: 0.3,
              animationPlayState: 'paused' 
            }}
          />
        );
      }
    }
    
    return lines;
  }, [audioData, isAgentSpeaking, isUserSpeaking]);

  // Get the status text
  const getStatusText = () => {
    if (callStatus === 'idle') return 'Ready to Connect';
    if (callStatus === 'connecting') return 'Connecting...';
    if (callStatus === 'active') {
      if (isAgentSpeaking) return 'Agent Speaking';
      if (isUserSpeaking) return 'Listening...';
      return 'Connected';
    }
    if (callStatus === 'disconnected') return 'Call Ended';
    if (callStatus === 'error') return 'Connection Error';
    return '';
  };

  // Determine the color based on status
  const getStateColor = () => {
    if (callStatus === 'active') {
      if (isAgentSpeaking || isUserSpeaking) return 'bg-primary/10 border-primary';
      return 'bg-secondary border-secondary/80';
    }
    if (callStatus === 'connecting') return 'bg-amber-100 border-amber-300 dark:bg-amber-900/20 dark:border-amber-700';
    if (callStatus === 'disconnected' || callStatus === 'error') return 'bg-red-100 border-red-300 dark:bg-red-900/20 dark:border-red-700';
    return 'bg-secondary border-secondary/80';
  };

  return (
    <div className="flex flex-col items-center">
      {/* Main circle containing the audio visualization */}
      <div 
        className={`relative w-60 h-60 rounded-full flex items-center justify-center transition-all duration-500 border-2 shadow-lg animate-fade-in ${getStateColor()}`}
      >
        {/* Ripple effect when speaking */}
        {(isAgentSpeaking || isUserSpeaking) && (
          <div className="absolute inset-0 ripple-container">
            <div className={`absolute inset-0 rounded-full border-2 ${isAgentSpeaking ? 'border-primary/50' : 'border-primary/40'}`}></div>
          </div>
        )}
        
        {/* Audio visualization */}
        <div className="flex items-center h-16 space-x-1">
          {audioLines}
        </div>
        
        {/* Status text */}
        <div className="absolute bottom-10 text-center">
          <p className="text-sm font-medium text-foreground/80">{getStatusText()}</p>
        </div>
      </div>
      
      {/* Controls */}
      <div className="mt-8 flex space-x-6">
        {/* Call button */}
        {callStatus !== 'active' ? (
          <button 
            onClick={onStartCall}
            disabled={callStatus === 'connecting' || callStatus === 'disconnected'}
            className="p-4 rounded-full bg-green-100 text-green-600 border border-green-200 hover:bg-green-200 hover:text-green-700 transition-colors duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Start Call"
          >
            <Phone className="w-6 h-6" />
          </button>
        ) : (
          <button 
            onClick={onEndCall}
            className="p-4 rounded-full bg-red-100 text-red-600 border border-red-200 hover:bg-red-200 hover:text-red-700 transition-colors duration-300 shadow-md"
            aria-label="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        )}
        
        {/* Mic button - only shown when call is active */}
        {callStatus === 'active' && (
          isUserSpeaking ? (
            <button 
              onClick={onStopSpeaking}
              className="p-4 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors duration-300 shadow-md"
              aria-label="Stop Speaking"
            >
              <Mic className="w-6 h-6" />
            </button>
          ) : (
            <button 
              onClick={onStartSpeaking}
              className="p-4 rounded-full bg-secondary text-muted-foreground border border-secondary/80 hover:bg-secondary/80 transition-colors duration-300 shadow-md"
              aria-label="Start Speaking"
            >
              <MicOff className="w-6 h-6" />
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default VoiceVisualizer;
