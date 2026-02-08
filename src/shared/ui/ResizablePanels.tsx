import { useState, useRef, useEffect, ReactNode } from 'react';

interface ResizablePanelsProps {
  topPanel: ReactNode;
  bottomPanel: ReactNode;
  defaultHeight?: number;
  minHeight?: number;
}

export function ResizablePanels({
  topPanel,
  bottomPanel,
  defaultHeight = 50,
  minHeight = 20
}: ResizablePanelsProps) {
  const [topHeight, setTopHeight] = useState(defaultHeight);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100;

      if (newHeight >= minHeight && newHeight <= 100 - minHeight) {
        setTopHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minHeight]);

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      <div style={{ height: `${topHeight}%` }} className="overflow-hidden">
        {topPanel}
      </div>

      <div
        onMouseDown={() => setIsDragging(true)}
        className={`
          h-1 cursor-row-resize bg-border-subtle hover:bg-accent transition-colors duration-fast
          relative group
          ${isDragging ? 'bg-accent' : ''}
        `}
      >
        <div className="absolute inset-x-0 -top-1 -bottom-1" />
      </div>

      <div style={{ height: `${100 - topHeight}%` }} className="overflow-hidden">
        {bottomPanel}
      </div>
    </div>
  );
}
