
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface WaveAnimationProps {
  className?: string;
}

const WaveAnimation: React.FC<WaveAnimationProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number; y: number; radius: number; color: string; speedY: number; amplitude: number; frequency: number; phase: number }[] = [];
    
    // Set canvas dimensions
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles();
    };

    // Initialize particles
    const initParticles = () => {
      particles = [];
      const particleCount = Math.floor(canvas.width / 8); // Adjust density
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: i * (canvas.width / particleCount),
          y: canvas.height / 2,
          radius: Math.random() * 2 + 1,
          color: `rgba(${139 + Math.random() * 40}, ${92 + Math.random() * 40}, ${246 + Math.random() * 10}, ${0.3 + Math.random() * 0.5})`,
          speedY: 0.05 + Math.random() * 0.1,
          amplitude: 20 + Math.random() * 30,
          frequency: 0.01 + Math.random() * 0.02,
          phase: Math.random() * Math.PI * 2
        });
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connecting line
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Update particle position - wave motion
        p.phase += p.frequency;
        p.y = canvas.height / 2 + Math.sin(p.phase) * p.amplitude;
        
        // Draw line to particle
        ctx.lineTo(p.x, p.y);
        
        // Prepare for next particle
        if (i === particles.length - 1) {
          ctx.lineTo(canvas.width, canvas.height / 2);
        }
      }
      
      // Style and stroke the line
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Fill the area below the line
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fillStyle = 'rgba(139, 92, 246, 0.1)';
      ctx.fill();
      
      // Draw particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    // Set up resize listener
    window.addEventListener('resize', handleResize);
    handleResize();
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className={cn('w-full h-32', className)}
    />
  );
};

export default WaveAnimation;
