import React from 'react';
import { Cabinet } from '@/lib/floorPlanData';

interface CabinetMarkerProps {
  cabinet: Cabinet;
  isSelected: boolean;
  onClick: () => void;
}

const CabinetMarker: React.FC<CabinetMarkerProps> = ({ cabinet, isSelected, onClick }) => {
  const isOnline = cabinet.status === 'online';
  const isInProgress = cabinet.installationStatus === 'in_progress';
  const size = 23;
  const x = cabinet.x;
  const y = cabinet.y;

  const borderColor = '#F59E0B';
  const borderWidth = isSelected ? 3 : 2;

  const renderMarker = () => {
    if (cabinet.installCabinet) {
      // CCTV OUTDOOR STEEL CABINET representation
      return (
        <g>
          {/* Cabinet body */}
          <rect x={x - size / 2} y={y - size / 2} width={size} height={size} fill="none" stroke={borderColor} strokeWidth={borderWidth} />

          {/* Cabinet door */}
          <rect x={x - size / 2 + 3} y={y - size / 2 + 3} width={size - 6} height={size - 6} fill="none" stroke={borderColor} strokeWidth={1} />

          {/* Door handle */}
          <circle cx={x + size / 2 - 8} cy={y} r={3} fill="none" stroke={borderColor} strokeWidth={1} />

          {/* Ventilation slots */}
          {Array.from({ length: 3 }).map((_, i) => (
            <line key={i} x1={x - size / 2 + 10} y1={y - size / 2 + 15 + i * 15} x2={x - size / 2 + 20} y2={y - size / 2 + 15 + i * 15} stroke={borderColor} strokeWidth={1} />
          ))}

          {/* Mounting feet */}
          <line x1={x - size / 2 + 5} y1={y + size / 2} x2={x - size / 2 + 10} y2={y + size / 2 + 5} stroke={borderColor} strokeWidth={1} />
          <line x1={x + size / 2 - 5} y1={y + size / 2} x2={x + size / 2 - 10} y2={y + size / 2 + 5} stroke={borderColor} strokeWidth={1} />
        </g>
      );
    } else {
      // Default cabinet indicator (just square)
      return (
        <rect x={x - size / 2} y={y - size / 2} width={size} height={size} fill="none" stroke={borderColor} strokeWidth={borderWidth} />
      );
    }
  };

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Invisible click area - much larger for easy clicking */}
      <rect x={x - size / 2 - 20} y={y - size / 2 - 20} width={size + 40} height={size + 40} fill="none" stroke="none" pointerEvents="all" />

      {/* Online pulse animation */}
      {isOnline && (
        <>
          <style>{`
            @keyframes pulse-cabinet {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.3; }
            }
            .pulse-cabinet-${cabinet.id} {
              animation: pulse-cabinet 1.5s infinite;
            }
          `}</style>
          <rect x={x - size / 2 - 8} y={y - size / 2 - 8} width={size + 16} height={size + 16} fill="none" stroke="#22C55E" strokeWidth={2} className={`pulse-cabinet-${cabinet.id}`} />
        </>
      )}

      {/* In Progress yellow blinking border */}
      {isInProgress && (
        <>
          <style>{`
            @keyframes blink-yellow-cabinet {
              0%, 100% { opacity: 1; }
              50% { opacity: 0; }
            }
            .blink-cabinet-${cabinet.id} {
              animation: blink-yellow-cabinet 1s infinite;
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
            className={`blink-cabinet-${cabinet.id}`}
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
        {cabinet.name}
      </text>

      {/* Tooltip */}
      <title>{cabinet.name}\nStatus: {cabinet.status}\nInstallation: {cabinet.installationStatus === 'completed' ? 'Completed' : cabinet.installationStatus === 'in_progress' ? 'In Progress' : 'Not Started'}</title>
    </g>
  );
};

export default CabinetMarker;
