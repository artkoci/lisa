
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import WaveAnimation from '@/components/WaveAnimation';

const Landing = () => {
  const navigate = useNavigate();
  const handleEnter = () => {
    navigate('/voice');
  };
  
  return <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black text-white">
      {/* Ambient gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950/30 to-black opacity-80 z-0"></div>
      
      {/* Animated gradient orb */}
      <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-purple-800/30 via-purple-500/20 to-pink-600/30 blur-3xl animate-float opacity-30"></div>
      
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:100px_100px] z-0 opacity-20"></div>
      
      {/* Sound wave visualization */}
      <div className="absolute inset-x-0 bottom-0 h-48 z-10 opacity-80">
        <WaveAnimation className="h-full" />
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 z-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-purple-500/10"
            style={{
              width: `${Math.random() * 8 + 2}px`,
              height: `${Math.random() * 8 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 text-center space-y-12 px-6">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-purple-200/80 animate-fade-in">
          Reverse Lisa
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-md mx-auto animate-fade-in opacity-80">
          Experience the future of voice interaction
        </p>
        
        <div className="pt-8 animate-slide-up">
          <button onClick={handleEnter} className={cn("group relative overflow-hidden rounded-full px-8 py-4", "bg-gradient-to-br from-purple-900 to-purple-950", "text-white font-medium text-lg", "border border-purple-800/30", "shadow-xl shadow-purple-900/20", "hover:shadow-purple-800/30 transition-all duration-300")}>
            {/* Button background effects */}
            <span className="absolute inset-0 flex items-center justify-center w-full h-full">
              <span className="absolute inset-0 bg-gradient-to-tr from-purple-700/0 via-purple-700/10 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            </span>
            
            <span className="relative flex items-center gap-2">
              <Phone className="w-5 h-5 text-purple-300" />
              <span>Enter the Voice Dimension</span>
            </span>
          </button>
        </div>
        
        <div className="absolute bottom-8 left-0 right-0 text-center text-purple-300/50 text-sm animate-fade-in">
          <p>The future is speaking</p>
        </div>
      </div>
    </div>;
};

export default Landing;
