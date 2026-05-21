import React, { useState } from 'react';
import { Camera, Rack, Cabinet } from '@/lib/floorPlanData';

interface DraggableMarkerProps {
  item: Camera | Rack | Cabinet;
  isSelected: boolean;
  isDragging: boolean;
  onDragStart: (e: React.MouseEvent) => void;
  onDragEnd: (e: React.MouseEvent) => void;
  onDragMove: (e: React.MouseEvent) => void;
  onClick: () => void;
  children: React.ReactNode;
}

const DraggableMarker: React.FC<DraggableMarkerProps> = ({
  item,
  isSelected,
  isDragging,
  onDragStart,
  onDragEnd,
  onDragMove,
  onClick,
  children,
}) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
    if (isSelected) {
      onDragStart(e);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      onDragMove(e);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    onDragEnd(e);
  };

  return (
    <g
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        cursor: isSelected ? 'grab' : 'pointer',
        opacity: isDragging ? 0.7 : 1,
      }}
    >
      {children}
    </g>
  );
};

export default DraggableMarker;
