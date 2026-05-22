import React from 'react';
import { Camera } from '@/lib/floorPlanData';

interface CameraMarkerProps {
  camera: Camera;
  isSelected: boolean;
  onClick: () => void;
}

const CameraMarker: React.FC<CameraMarkerProps> = ({ camera, isSelected, onClick }) => {
  const isOnline = camera.status === 'online';
  const isInProgress = camera.installationStatus === 'in_progress';
  const size = 12; // Reduced to half (12px)
  const x = camera.x;
  const y = camera.y;
  const rotation = camera.rotation || 0;

  // Color based on type: Type 1 = Red, Type 2 = Blue
  const fillColor = camera.type === 'type1' ? '#DC2626' : '#2563EB';
  const borderColor = camera.type === 'type1' ? '#991B1B' : '#1E40AF';
  const borderWidth = isSelected ? 2 : 1.5;

  // Render triangle pointing right (arrow shape) with yellow edge
  const renderMarker = () => {
    // Triangle pointing right: base on left, point on right
    const points = `${x - size / 2},${y - size / 2} ${x - size / 2},${y + size / 2} ${x + size / 2},${y}`;
    
    return (
      <g transform={`rotate(${rotation} ${x} ${y})`}>
        {/* Main triangle */}
        <polygon
          points={points}
          fill={fillColor}
          stroke={borderColor}
          strokeWidth={borderWidth}
          opacity="0.9"
        />
        
        {/* Bright yellow edge on the right side (pointing direction) - single thick line */}
        <line
          x1={x + size / 2}
          y1={y}
          x2={x - size / 2}
          y2={y - size / 2}
          stroke="#FFEB3B"
          strokeWidth={6}
          strokeLinecap="round"
          opacity="0.95"
        />
        
        {/* Inner circle for camera indicator */}
        <circle cx={x - size / 6} cy={y} r={size / 5} fill="white" opacity="0.8" />
      </g>
    );
  };

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Invisible click area - much larger for easy clicking */}
      <polygon
        points={`${x - size / 2 - 15},${y - size / 2 - 15} ${x - size / 2 - 15},${y + size / 2 + 15} ${x + size / 2 + 15},${y}`}
        fill="none"
        stroke="none"
        pointerEvents="all"
        transform={`rotate(${rotation} ${x} ${y})`}
      />

      {/* Online pulse animation */}
      {isOnline && (
        <>
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.3; }
            }
            .pulse-${camera.id} {
              animation: pulse 1.5s infinite;
            }
          `}</style>
          <polygon
            points={`${x - size / 2 - 5},${y - size / 2 - 5} ${x - size / 2 - 5},${y + size / 2 + 5} ${x + size / 2 + 5},${y}`}
            fill="none"
            stroke="#22C55E"
            strokeWidth={2}
            className={`pulse-${camera.id}`}
            opacity="0.7"
            transform={`rotate(${rotation} ${x} ${y})`}
          />
        </>
      )}

      {/* In Progress yellow blinking border */}
      {isInProgress && (
        <>
          <style>{`
            @keyframes blink-yellow-cam {
              0%, 100% { opacity: 1; stroke-width: 2.5; }
              50% { opacity: 0; stroke-width: 2.5; }
            }
            .blink-inprogress-${camera.id} {
              animation: blink-yellow-cam 1s infinite;
            }
          `}</style>
          <polygon
            points={`${x - size / 2 - 7},${y - size / 2 - 7} ${x - size / 2 - 7},${y + size / 2 + 7} ${x + size / 2 + 7},${y}`}
            fill="none"
            stroke="#EAB308"
            strokeWidth={2.5}
            className={`blink-inprogress-${camera.id}`}
            transform={`rotate(${rotation} ${x} ${y})`}
          />
        </>
      )}

      {/* Main marker */}
      {renderMarker()}

      {/* Selection highlight */}
      {isSelected && (
        <polygon
          points={`${x - size / 2 - 8},${y - size / 2 - 8} ${x - size / 2 - 8},${y + size / 2 + 8} ${x + size / 2 + 8},${y}`}
          fill="none"
          stroke="#0066CC"
          strokeWidth={2}
          strokeDasharray="4,4"
          transform={`rotate(${rotation} ${x} ${y})`}
        />
      )}

      {/* Label on hover */}
      <title>{camera.name}\nStatus: {camera.status}\nInstallation: {camera.installationStatus === 'completed' ? 'Completed' : camera.installationStatus === 'in_progress' ? 'In Progress' : 'Not Started'}\nRotation: {rotation}°</title>
    </g>
  );
};

export default CameraMarker;
