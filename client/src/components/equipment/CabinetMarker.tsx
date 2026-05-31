import React from "react";
import { Cabinet } from "@/lib/floorPlanData";

interface CabinetMarkerProps {
  cabinet: Cabinet;
  isSelected: boolean;
  onClick: () => void;
}

const CabinetMarker: React.FC<CabinetMarkerProps> = ({
  cabinet,
  isSelected,
  onClick,
}) => {
  const x = cabinet.x;
  const y = cabinet.y;

  const isOnline = cabinet.status === "online";
  const isInProgress =
    cabinet.installationStatus === "in_progress";
  const isCompleted =
    cabinet.installationStatus === "completed";
  const isUrgent =
    Boolean((cabinet as any).isUrgent);

  const cabinetColor = "#f97316";
  const w = 28;
  const h = 38;

  return (
    <g
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      {/* Click Area */}
      <rect
        x={x - 28}
        y={y - 34}
        width={56}
        height={76}
        fill="transparent"
        pointerEvents="all"
      />

      {/* In Progress */}
      {isInProgress && (
        <rect
          x={x - w / 2 - 4}
          y={y - h / 2 - 4}
          width={w + 8}
          height={h + 8}
          rx={6}
          fill="none"
          stroke="#eab308"
          strokeWidth={3}
          className="animate-pulse"
        />
      )}

      {/* Completed */}
      {isCompleted && (
        <rect
          x={x - w / 2 - 4}
          y={y - h / 2 - 4}
          width={w + 8}
          height={h + 8}
          rx={6}
          fill="none"
          stroke="#22c55e"
          strokeWidth={3}
          className="animate-pulse"
        />
      )}

      {/* Urgent */}
      {isUrgent && (
        <circle
          cx={x}
          cy={y}
          r={30}
          fill="none"
          stroke="#ff4db8"
          strokeWidth={4}
          className="animate-pulse"
        />
      )}

      {/* Online */}
      {isOnline && (
        <circle
          cx={x}
          cy={y}
          r={26}
          fill="none"
          stroke="#22c55e"
          strokeWidth={2}
          className="animate-pulse"
        />
      )}

      {/* Cabinet Icon */}
      <g
        transform={`translate(${x - w / 2}, ${
          y - h / 2
        })`}
      >
        {/* Top yellow cover */}
        <path
          d={`
            M 0 2
            L 4 -4
            L ${w - 4} -4
            L ${w} 2
            L ${w} 7
            L 0 7
            Z
          `}
          fill="#fbbf24"
          stroke="#f59e0b"
          strokeWidth={1.5}
        />

        {/* Cabinet body */}
        <rect
          x={2}
          y={7}
          width={w - 4}
          height={h - 7}
          rx={2}
          fill="#d1d5db"
          stroke="#4b5563"
          strokeWidth={1.6}
        />

        {/* Inner door */}
        <rect
          x={6}
          y={12}
          width={w - 12}
          height={h - 15}
          rx={2}
          fill="#cfd4d7"
          stroke="#6b7280"
          strokeWidth={1}
        />

        {/* Display panel */}
        <rect
          x={7}
          y={12}
          width={w - 14}
          height={7}
          rx={1.5}
          fill="#111827"
          stroke="#374151"
          strokeWidth={1}
        />

        {/* Vent dots */}
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => (
            <circle
              key={`${row}-${col}`}
              cx={11 + col * 3}
              cy={14 + row * 1.6}
              r={0.65}
              fill="#e5e7eb"
            />
          ))
        )}

        {/* Status lights */}
        <circle
          cx={w - 8}
          cy={14}
          r={1.5}
          fill="#ef4444"
        />
        <circle
          cx={w - 8}
          cy={18}
          r={1.5}
          fill="#22c55e"
        />

        {/* Warning triangle */}
        <path
          d={`
            M ${w / 2} 22
            L ${w / 2 - 5} 31
            L ${w / 2 + 5} 31
            Z
          `}
          fill="#facc15"
          stroke="#92400e"
          strokeWidth={1}
        />

        <text
          x={w / 2}
          y={30}
          textAnchor="middle"
          fontSize="8"
          fill="#111827"
          fontWeight="900"
        >
          !
        </text>

        {/* Door handle */}
        <rect
          x={6}
          y={25}
          width={2}
          height={8}
          rx={1}
          fill="#9ca3af"
        />

        {/* Base */}
        <rect
          x={3}
          y={h - 2}
          width={w - 6}
          height={3}
          fill="#4b5563"
        />
      </g>

      {/* Selected */}
      {isSelected && (
        <rect
          x={x - w / 2 - 6}
          y={y - h / 2 - 8}
          width={w + 12}
          height={h + 14}
          rx={6}
          fill="none"
          stroke="#0066cc"
          strokeWidth={2}
          strokeDasharray="4,4"
        />
      )}

      {/* Label */}
      <text
        x={x}
        y={y + 34}
        textAnchor="middle"
        fontSize="12"
        fill={cabinetColor}
        fontWeight="800"
      >
        CAB
      </text>

      <title>
        {cabinet.name}
        {"\n"}Status: {cabinet.status}
        {"\n"}Installation:{" "}
        {cabinet.installationStatus === "completed"
          ? "Completed"
          : cabinet.installationStatus ===
            "in_progress"
          ? "In Progress"
          : "Not Started"}
      </title>
    </g>
  );
};

export default CabinetMarker;
