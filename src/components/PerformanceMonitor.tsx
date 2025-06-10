import React, { useState, useEffect, useCallback } from 'react';
import './PerformanceMonitor.css';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  frameTime: number;
  totalFrames: number;
  droppedFrames: number;
}

interface PerformanceMonitorProps {
  isVisible: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ isVisible }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    frameTime: 0,
    totalFrames: 0,
    droppedFrames: 0
  });

  const [lastFrameTime, setLastFrameTime] = useState(performance.now());
  const [frameCount, setFrameCount] = useState(0);
  const [totalFrameCount, setTotalFrameCount] = useState(0);
  const [droppedFrameCount, setDroppedFrameCount] = useState(0);

  const updateMetrics = useCallback(() => {
    const now = performance.now();
    const deltaTime = now - lastFrameTime;
    
    setFrameCount(prev => prev + 1);
    setTotalFrameCount(prev => prev + 1);
    
    // FPS hesaplama (her saniye güncelle)
    if (deltaTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / deltaTime);
      
      // Düşük FPS tespit etme (60 FPS'in altı dropped frame sayılır)
      if (fps < 55) {
        setDroppedFrameCount(prev => prev + (60 - fps));
      }

      setMetrics(prev => ({
        ...prev,
        fps,
        frameTime: deltaTime / frameCount,
        totalFrames: totalFrameCount,
        droppedFrames: droppedFrameCount,
        memoryUsage: (performance as any).memory ? 
          Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) : 0
      }));

      setFrameCount(0);
      setLastFrameTime(now);
    }
  }, [lastFrameTime, frameCount, totalFrameCount, droppedFrameCount]);

  useEffect(() => {
    if (!isVisible) return;

    let animationFrame: number;
    
    const animate = () => {
      updateMetrics();
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isVisible, updateMetrics]);

  const getPerformanceStatus = (fps: number) => {
    if (fps >= 55) return 'excellent';
    if (fps >= 45) return 'good';
    if (fps >= 30) return 'fair';
    return 'poor';
  };

  if (!isVisible) return null;

  return (
    <div className="performance-monitor">
      <div className="performance-header">
        <span className="performance-title">⚡ Performans</span>
        <span className={`performance-status ${getPerformanceStatus(metrics.fps)}`}>
          {getPerformanceStatus(metrics.fps)}
        </span>
      </div>
      
      <div className="performance-metrics">
        <div className="metric">
          <span className="metric-label">FPS:</span>
          <span className={`metric-value fps-${getPerformanceStatus(metrics.fps)}`}>
            {metrics.fps}
          </span>
        </div>
        
        <div className="metric">
          <span className="metric-label">Frame:</span>
          <span className="metric-value">
            {metrics.frameTime.toFixed(1)}ms
          </span>
        </div>
        
        {metrics.memoryUsage > 0 && (
          <div className="metric">
            <span className="metric-label">RAM:</span>
            <span className="metric-value">
              {metrics.memoryUsage}MB
            </span>
          </div>
        )}
        
        <div className="metric">
          <span className="metric-label">Toplam:</span>
          <span className="metric-value">
            {metrics.totalFrames}
          </span>
        </div>
        
        {metrics.droppedFrames > 0 && (
          <div className="metric">
            <span className="metric-label">Düşük:</span>
            <span className="metric-value warning">
              {metrics.droppedFrames}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}; 