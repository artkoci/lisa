
import { useEffect, useState, useRef } from 'react';
import { AudioAnalysisData } from '@/types';

export const useAudioVisualization = (isActive: boolean) => {
  const [audioData, setAudioData] = useState<AudioAnalysisData | null>(null);
  const [isMicrophoneActive, setIsMicrophoneActive] = useState<boolean>(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize audio context and analyzer
  useEffect(() => {
    if (!isActive) return;

    const initializeAudio = async () => {
      try {
        // Create audio context
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
        
        // Create analyzer node
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        // Get user microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        
        // Connect microphone to analyzer
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        
        setIsMicrophoneActive(true);
        
        // Start visualization loop
        startVisualization();
      } catch (error) {
        console.error('Error initializing audio:', error);
        setIsMicrophoneActive(false);
      }
    };

    initializeAudio();

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      
      setIsMicrophoneActive(false);
    };
  }, [isActive]);

  const startVisualization = () => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    const timeData = new Uint8Array(analyser.frequencyBinCount);
    
    const updateData = () => {
      if (!analyser) return;
      
      analyser.getByteFrequencyData(frequencyData);
      analyser.getByteTimeDomainData(timeData);
      
      // Calculate volume (average of frequency data)
      const sum = frequencyData.reduce((acc, val) => acc + val, 0);
      const volume = sum / frequencyData.length / 255; // Normalize to 0-1
      
      setAudioData({
        frequencyData: new Uint8Array(frequencyData),
        timeData: new Uint8Array(timeData),
        volume
      });
      
      animationFrameRef.current = requestAnimationFrame(updateData);
    };
    
    updateData();
  };

  // Function to simulate audio data for when the agent is speaking
  const simulateAgentAudio = () => {
    if (!isActive) return;
    
    const fakeFrequencyData = new Uint8Array(128);
    const fakeTimeData = new Uint8Array(128);
    
    // Simulate waveform data
    for (let i = 0; i < 128; i++) {
      const randomValue = Math.random() * 255 * 0.7 + (Math.sin(Date.now() / 200 + i) + 1) * 30;
      fakeFrequencyData[i] = randomValue;
      fakeTimeData[i] = 128 + Math.sin(Date.now() / 100 + i) * 30;
    }
    
    setAudioData({
      frequencyData: fakeFrequencyData,
      timeData: fakeTimeData,
      volume: 0.5 + Math.sin(Date.now() / 500) * 0.2
    });
    
    animationFrameRef.current = requestAnimationFrame(simulateAgentAudio);
  };

  // Exposed functions
  const startUserAudio = async () => {
    if (isMicrophoneActive) return;
    
    try {
      // Create audio context if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      // Create analyzer if it doesn't exist
      if (!analyserRef.current) {
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;
      }
      
      // Get user microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      // Connect microphone to analyzer
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      setIsMicrophoneActive(true);
      startVisualization();
    } catch (error) {
      console.error('Error starting user audio:', error);
    }
  };

  const stopUserAudio = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    setIsMicrophoneActive(false);
  };

  const startAgentAudio = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    simulateAgentAudio();
  };

  const stopAgentAudio = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setAudioData(null);
  };

  return {
    audioData,
    isMicrophoneActive,
    startUserAudio,
    stopUserAudio,
    startAgentAudio,
    stopAgentAudio
  };
};
