import React, { useMemo } from 'react';
import { Mic, MicOff, Sparkle, X } from 'lucide-react';
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
  const audioLines = useMemo(() => {
    const lines = [];
    const numberOfLines = 20;
    
    if (audioData && (isAgentSpeaking || isUserSpeaking)) {
      for (let i = 0; i < numberOfLines; i++) {
        const frequencyIndex = Math.floor(i * (audioData.frequencyData.length / numberOfLines));
        const value = audioData.frequencyData[frequencyIndex] / 255;
        
        lines.push(
          <div 
            key={i} 
            className="audio-line" 
            style={{ 
              height: `${20 + value * 60}px`, 
              opacity: 0.3 + value * 0.7,
              backgroundColor: isAgentSpeaking 
                ? `rgba(168, 85, 247, ${0.5 + value * 0.5})` 
                : `rgba(139, 92, 246, ${0.5 + value * 0.5})`,
            }}
          />
        );
      }
    } else {
      for (let i = 0; i < numberOfLines; i++) {
        lines.push(
          <div 
            key={i} 
            className="audio-line" 
            style={{ 
              height: '8px', 
              opacity: 0.2,
              backgroundColor: 'rgba(139, 92, 246, 0.3)',
              animationPlayState: 'paused' 
            }}
          />
        );
      }
    }
    
    return lines;
  }, [audioData, isAgentSpeaking, isUserSpeaking]);

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

  const getStateColor = () => {
    if (callStatus === 'active') {
      if (isAgentSpeaking || isUserSpeaking) return 'bg-purple-950/40 border-purple-700/50';
      return 'bg-purple-950/30 border-purple-900/30';
    }
    if (callStatus === 'connecting') return 'bg-amber-950/30 border-amber-700/40';
    if (callStatus === 'disconnected' || callStatus === 'error') return 'bg-red-950/30 border-red-700/40';
    return 'bg-purple-950/30 border-purple-900/30';
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`relative w-72 h-72 rounded-full flex items-center justify-center transition-all duration-700 border-2 shadow-[0_0_100px_rgba(168,85,247,0.3)] backdrop-blur-lg ${getStateColor()}`}
      >
        <div className="absolute inset-0 rounded-full bg-purple-600/5 blur-xl"></div>
        
        {(isAgentSpeaking || isUserSpeaking) && (
          <div className="absolute inset-0 ripple-container">
            <div className={`absolute inset-0 rounded-full border-2 ${isAgentSpeaking ? 'border-purple-500/50' : 'border-purple-400/40'}`}></div>
          </div>
        )}
        
        <div className="flex items-center h-20 space-x-0.5 z-10">
          {audioLines}
        </div>
        
        <div className="absolute bottom-10 text-center z-10">
          <p className="text-sm font-medium text-purple-100">{getStatusText()}</p>
        </div>
      </div>
      
      <div className="mt-8 flex space-x-6">
        {callStatus !== 'active' ? (
          <button 
            onClick={onStartCall}
            disabled={callStatus === 'connecting' || callStatus === 'disconnected'}
            className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-900/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            aria-label="Start Call"
          >
            <Sparkle className="w-6 h-6" />
          </button>
        ) : (
          <button 
            onClick={onEndCall}
            className="p-4 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-lg hover:shadow-red-900/30 transition-all duration-300 transform hover:scale-105 active:scale-95"
            aria-label="End Call"
          >
            <X className="w-6 h-6" />
          </button>
        )}
        
        {callStatus === 'active' && (
          isUserSpeaking ? (
            <button 
              onClick={onStopSpeaking}
              className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-900/30 transition-all duration-300 transform hover:scale-105 active:scale-95"
              aria-label="Stop Speaking"
            >
              <Mic className="w-6 h-6" />
            </button>
          ) : (
            <button 
              onClick={onStartSpeaking}
              className="p-4 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
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
