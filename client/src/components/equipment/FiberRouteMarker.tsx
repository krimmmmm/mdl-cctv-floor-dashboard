import React from "react";
import { FiberRoute } from "@/lib/floorPlanData";

interface FiberRouteMarkerProps {
  route: FiberRoute;
  isSelected?: boolean;
}

const FiberRouteMarker: React.FC<FiberRouteMarkerProps> = ({
  route,
  isSelected = false,
}) => {
  const points = route.points || [];
  if (points.length < 2) return null;

  const progress = Math.min(
    100,
    Math.max(0, Number((route as any).progress || 0))
  );

  const progressDirection =
    (route as any).progressDirection || "start";

  const routeIdSafe = route.id.replace(/[^a-zA-Z0-9]/g, "_");

  const pathData = points.reduce((acc, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    return `${acc} L ${point.x} ${point.y}`;
  }, "");

  const midIdx = Math.floor(points.length / 2);
  const labelPt = points[midIdx] || points[0];

  const redColor = "#ef4444";
  const greenColor = "#16a34a";

  return (
    <g>
      <style>{`
        @keyframes fiber-green-pulse-${routeIdSafe} {
          0%, 100% { opacity: 0.95; }
          50% { opacity: 0.55; }
        }

        .fiber-green-progress-${routeIdSafe} {
          stroke-dasharray: ${progress} ${100 - progress};
          stroke-dashoffset: ${
            progressDirection === "end" ? -100 : 0
          };
          animation: fiber-green-pulse-${routeIdSafe} 0.8s ease-in-out infinite;
        }
      `}</style>

      {/* Selection glow */}
      {isSelected && (
        <path
          d={pathData}
          fill="none"
          stroke="#fbbf24"
          strokeWidth={12}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.45}
          pathLength={100}
        />
      )}

      {/* Full red base line */}
      <path
        d={pathData}
        fill="none"
        stroke={redColor}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.95}
        pathLength={100}
      />

      {/* Green progress line */}
      {progress > 0 && (
        <path
          d={pathData}
          fill="none"
          stroke={greenColor}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.95}
          pathLength={100}
          className={`fiber-green-progress-${routeIdSafe}`}
        />
      )}

      {/* Waypoint dots */}
      {points.map((pt, i) => (
        <circle
          key={i}
          cx={pt.x}
          cy={pt.y}
          r={isSelected ? 5 : 4}
          fill={isSelected ? "#fbbf24" : redColor}
          stroke="white"
          strokeWidth={1.5}
        />
      ))}

      {/* Route label */}
      {labelPt && (
        <>
          <rect
            x={labelPt.x - 48}
            y={labelPt.y - 26}
            width={96}
            height={22}
            rx={6}
            fill="white"
            opacity={0.9}
          />

          <text
            x={labelPt.x}
            y={labelPt.y - 11}
            textAnchor="middle"
            fontSize="10"
            fill={isSelected ? "#92400e" : redColor}
            fontWeight="bold"
          >
            {(route.name || "Fiber Route")} {progress}%
          </text>
        </>
      )}
    </g>
  );
};

export default FiberRouteMarker;
