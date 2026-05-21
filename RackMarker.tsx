import React from 'react';
import { Rack } from '@/lib/floorPlanData';

interface RackMarkerProps {
  rack: Rack;
  isSelected: boolean;
  onClick: () => void;
}

const RackMarker: React.FC<RackMarkerProps> = ({ rack, isSelected, onClick }) => {
  const isOnline = rack.status === 'online';
  const isInProgress = rack.installationStatus === 'in_progress';
  const size = 20;
  const x = rack.x;
  const y = rack.y;

  // Color based on type
  const borderColor = rack.type === 'old' ? '#3B82F6' : '#22C55E';
  const borderWidth = isSelected ? 3 : 2;

  const renderMarker = () => {
    // WALL RACK 19" GERMAN 6U representation
    return (
      <g>
        {/* Main rack body */}
        <rect x={x - size / 2} y={y - size / 2} width={size} height={size} fill="none" stroke={borderColor} strokeWidth={borderWidth} />

        {/* Rack units (6U) */}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={i} x1={x - size / 2} y1={y - size / 2 + (i + 1) * (size / 6)} x2={x + size / 2} y2={y - size / 2 + (i + 1) * (size / 6)} stroke={borderColor} strokeWidth={0.5} />
        ))}

        {/* Rack rails */}
        <line x1={x - size / 2 + 5} y1={y - size / 2} x2={x - size / 2 + 5} y2={y + size / 2} stroke={borderColor} strokeWidth={1} />
        <line x1={x + size / 2 - 5} y1={y - size / 2} x2={x + size / 2 - 5} y2={y + size / 2} stroke={borderColor} strokeWidth={1} />
      </g>
    );
  };

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Invisible click area - much larger for easy clicking */}
      <rect x={x - size / 2 - 20} y={y - size / 2 - 20} width={size + 40} height={size + 40} fill="none" stroke="none" pointerEvents="all" />

      {/* Online pulse animation */}
      {isOnline && (
        <>
          <style>{`
            @keyframes pulse-rack {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.3; }
            }
            .pulse-rack-${rack.id} {
              animation: pulse-rack 1.5s infinite;
            }
          `}</style>
          <rect x={x - size / 2 - 8} y={y - size / 2 - 8} width={size + 16} height={size + 16} fill="none" stroke="#22C55E" strokeWidth={2} className={`pulse-rack-${rack.id}`} />
        </>
      )}

      {/* In Progress yellow blinking border */}
      {isInProgress && (
        <>
          <style>{`
            @keyframes blink-yellow-rack {
              0%, 100% { opacity: 1; }
              50% { opacity: 0; }
            }
            .blink-rack-${rack.id} {
              animation: blink-yellow-rack 1s infinite;
            }
          `}</style>
          <rect
            x={x - size / 2 - 6}
            y={y - size / 2 - 6}
            width={size + 12}
            height={size + 12}
            fill="none"
            stroke="#EAB308"
            strokeWidth={2.5}
            className={`blink-rack-${rack.id}`}
          />
        </>
      )}

      {/* Main marker */}
      {renderMarker()}

      {/* Selection highlight */}
      {isSelected && (
        <rect x={x - size / 2 - 8} y={y - size / 2 - 8} width={size + 16} height={size + 16} fill="none" stroke="#0066CC" strokeWidth={2} strokeDasharray="4,4" />
      )}

      {/* Label - above the box */}
      <text x={x} y={y - size / 2 - 6} textAnchor="middle" fontSize="11" fill="#333333" fontWeight="600">
        {rack.name}
      </text>

      {/* Tooltip */}
      <title>{rack.name}\n{rack.type.toUpperCase()}\nStatus: {rack.status}\nInstallation: {rack.installationStatus === 'completed' ? 'Completed' : rack.installationStatus === 'in_progress' ? 'In Progress' : 'Not Started'}</title>
    </g>
  );
};

export default RackMarker;
