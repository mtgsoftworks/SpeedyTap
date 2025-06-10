import { useState } from 'react';

interface TouchPoint {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

interface TouchControllerProps {
  onTouch?: (touches: TouchPoint[]) => void;
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

const TouchController = ({ onTouch, onSwipe }: TouchControllerProps = {}) => {
  const [, setTouches] = useState<TouchPoint[]>([]);
  const [startTouch, setStartTouch] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touchList = Array.from(e.touches).map((touch) => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }));
    
    setTouches(touchList);
    if (touchList.length === 1) {
      setStartTouch({ x: touchList[0].x, y: touchList[0].y });
    }
    onTouch?.(touchList);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touchList = Array.from(e.touches).map((touch) => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }));
    
    setTouches(touchList);
    onTouch?.(touchList);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    
    // Swipe detection
    if (startTouch && onSwipe && e.changedTouches.length === 1) {
      const endTouch = e.changedTouches[0];
      const deltaX = endTouch.clientX - startTouch.x;
      const deltaY = endTouch.clientY - startTouch.y;
      const threshold = 50;

      if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          onSwipe(deltaX > 0 ? 'right' : 'left');
        } else {
          onSwipe(deltaY > 0 ? 'down' : 'up');
        }
      }
    }

    setTouches([]);
    setStartTouch(null);
    onTouch?.([]);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%', 
        height: '100%',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        pointerEvents: 'none',
        zIndex: 10000
      }}
    />
  );
};

export default TouchController; 