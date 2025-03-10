
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
    let time = 0;
    
    // Set canvas dimensions
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    // Animation loop
    const animate = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw primary wave
      drawWave(ctx, canvas, time, canvas.height / 2, 20, 'rgba(139, 92, 246, 0.5)', 2);
      
      // Draw secondary waves with different amplitudes, frequencies and phases
      drawWave(ctx, canvas, time * 0.8, canvas.height / 2 + 5, 15, 'rgba(139, 92, 246, 0.3)', 1.5);
      drawWave(ctx, canvas, time * 1.2, canvas.height / 2 - 5, 12, 'rgba(139, 92, 246, 0.3)', 1.5);
      
      // Draw subtle background waves
      drawWave(ctx, canvas, time * 0.5, canvas.height / 2 + 10, 8, 'rgba(139, 92, 246, 0.2)', 1);
      drawWave(ctx, canvas, time * 0.7, canvas.height / 2 - 10, 10, 'rgba(139, 92, 246, 0.2)', 1);
      
      animationFrameId = requestAnimationFrame(animate);
    };

    // Function to draw a smooth wave
    const drawWave = (
      ctx: CanvasRenderingContext2D, 
      canvas: HTMLCanvasElement, 
      time: number,
      baseY: number,
      amplitude: number,
      color: string,
      lineWidth: number
    ) => {
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      
      // Use bezier curves for smoother waves
      const segments = Math.ceil(canvas.width / 50); // Number of curve segments
      const segmentWidth = canvas.width / segments;
      
      for (let i = 0; i <= segments; i++) {
        const x = i * segmentWidth;
        // Multiple sine waves with different frequencies and phases for more natural look
        const y = baseY + 
                  amplitude * Math.sin(time + i * 0.2) + 
                  amplitude * 0.5 * Math.sin(time * 1.5 + i * 0.1);
        
        if (i === 0) {
          ctx.lineTo(x, y);
        } else {
          // Use quadratic curves for smoother transitions
          const prevX = (i - 1) * segmentWidth;
          const cpX = (prevX + x) / 2;
          const prevY = baseY + 
                        amplitude * Math.sin(time + (i - 1) * 0.2) + 
                        amplitude * 0.5 * Math.sin(time * 1.5 + (i - 1) * 0.1);
          ctx.quadraticCurveTo(cpX, prevY, x, y);
        }
      }
      
      // Complete the path to the bottom right and left for filling
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      
      // Fill with gradient
      const gradient = ctx.createLinearGradient(0, baseY, 0, canvas.height);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Draw the wave line
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      
      for (let i = 0; i <= segments; i++) {
        const x = i * segmentWidth;
        const y = baseY + 
                  amplitude * Math.sin(time + i * 0.2) + 
                  amplitude * 0.5 * Math.sin(time * 1.5 + i * 0.1);
        
        if (i === 0) {
          ctx.lineTo(x, y);
        } else {
          const prevX = (i - 1) * segmentWidth;
          const cpX = (prevX + x) / 2;
          const prevY = baseY + 
                        amplitude * Math.sin(time + (i - 1) * 0.2) + 
                        amplitude * 0.5 * Math.sin(time * 1.5 + (i - 1) * 0.1);
          ctx.quadraticCurveTo(cpX, prevY, x, y);
        }
      }
      
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
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
