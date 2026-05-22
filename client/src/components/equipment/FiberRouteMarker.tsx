import React from 'react';
import { FiberRoute } from '@/lib/floorPlanData';

interface FiberRouteMarkerProps {
  route: FiberRoute;
  isSelected?: boolean;
}

const FiberRouteMarker: React.FC<FiberRouteMarkerProps> = ({ route, isSelected = false }) => {
  const isActive = route.status === 'active';
  const color = route.color ?? (isActive ? '#22C55E' : '#EF4444');
  const strokeWidth = isSelected ? 4 : (isActive ? 3 : 2);

  // Create path string from points
  const pathData = route.points.reduce((acc, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    return `${acc} L ${point.x} ${point.y}`;
  }, '');

  if (!pathData) return null;

  const midIdx = Math.floor(route.points.length / 2);
  const labelPt = route.points[midIdx] ?? route.points[0];

  return (
    <g>
      {/* Selection glow */}
      {isSelected && (
        <path
          d={pathData}
          fill="none"
          stroke="#FBBF24"
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.5}
        />
      )}

      {/* Main fiber line */}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dashed animation for active routes */}
      {isActive && (
        <>
          <style>{`
            @keyframes dash {
              to { stroke-dashoffset: -10; }
            }
            .fiber-dash-${route.id.replace(/[^a-zA-Z0-9]/g, '_')} {
              stroke-dasharray: 5, 5;
              animation: dash 0.5s linear infinite;
            }
          `}</style>
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`fiber-dash-${route.id.replace(/[^a-zA-Z0-9]/g, '_')}`}
            opacity="0.5"
          />
        </>
      )}

      {/* Waypoint dots */}
      {route.points.map((pt, i) => (
        <circle
          key={i}
          cx={pt.x}
          cy={pt.y}
          r={isSelected ? 4 : 3}
          fill={isSelected ? '#FBBF24' : color}
          stroke="white"
          strokeWidth={1.5}
        />
      ))}

      {/* Route label */}
      {route.points.length > 1 && labelPt && (
        <>
          <rect
            x={labelPt.x - 28}
            y={labelPt.y - 20}
            width={56}
            height={14}
            rx={3}
            fill="white"
            opacity={0.75}
          />
          <text
            x={labelPt.x}
            y={labelPt.y - 9}
            textAnchor="middle"
            fontSize="9"
            fill={isSelected ? '#92400E' : color}
            fontWeight="bold"
          >
            {route.name ?? 'Fiber Optic'}
          </text>
        </>
      )}
    </g>
  );
};

export default FiberRouteMarker;
