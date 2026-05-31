import React from "react";
import { Rack } from "@/lib/floorPlanData";

interface RackMarkerProps {
  rack: Rack;
  isSelected: boolean;
  onClick: () => void;
}

const RackMarker: React.FC<RackMarkerProps> = ({
  rack,
  isSelected,
  onClick,
}) => {
  const x = rack.x;
  const y = rack.y;

  const isOnline = rack.status === "online";
  const isInProgress =
    rack.installationStatus === "in_progress";
  const isCompleted =
    rack.installationStatus === "completed";
  const isUrgent =
    Boolean((rack as any).isUrgent);

  const isType2 =
    rack.type === "type2" ||
    rack.type === "old";

  const rackColor = isType2
    ? "#2563eb" // Type2 Old RACK = Blue
    : "#16a34a"; // Type1 New RACK = Green

  const label = isType2 ? "R2" : "R1";

  const w = 26;
  const h = 32;

  return (
    <g
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <rect
        x={x - 28}
        y={y - 34}
        width={56}
        height={72}
        fill="transparent"
        pointerEvents="all"
      />

      <style>{`
        @keyframes rack-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
      `}</style>

      {isInProgress && (
        <rect
          x={x - 20}
          y={y - 24}
          width={40}
          height={48}
          rx={6}
          fill="none"
          stroke="#eab308"
          strokeWidth={4}
          style={{
            animation:
              "rack-blink 1s infinite",
          }}
        />
      )}

      {isCompleted && (
        <rect
          x={x - 20}
          y={y - 24}
          width={40}
          height={48}
          rx={6}
          fill="none"
          stroke="#22c55e"
          strokeWidth={4}
          style={{
            animation:
              "rack-blink 1s infinite",
          }}
        />
      )}

      {isUrgent && (
        <circle
          cx={x}
          cy={y}
          r={34}
          fill="none"
          stroke="#ff4db8"
          strokeWidth={4}
          style={{
            animation:
              "rack-blink 0.8s infinite",
          }}
        />
      )}

      {isOnline && (
        <circle
          cx={x}
          cy={y}
          r={30}
          fill="none"
          stroke="#22c55e"
          strokeWidth={2}
          style={{
            animation:
              "rack-blink 1.5s infinite",
          }}
        />
      )}

      {/* Rack Icon Body */}
      <g
        transform={`translate(${x - w / 2}, ${
          y - h / 2
        })`}
      >
        <rect
          x={0}
          y={0}
          width={w}
          height={h}
          rx={3}
          fill="white"
          stroke={rackColor}
          strokeWidth={2.5}
        />

        <rect
          x={4}
          y={4}
          width={w - 8}
          height={5}
          rx={1}
          fill="none"
          stroke={rackColor}
          strokeWidth={1.5}
        />

        <rect
          x={4}
          y={12}
          width={w - 8}
          height={5}
          rx={1}
          fill="none"
          stroke={rackColor}
          strokeWidth={1.5}
        />

        <rect
          x={4}
          y={20}
          width={w - 8}
          height={5}
          rx={1}
          fill="none"
          stroke={rackColor}
          strokeWidth={1.5}
        />

        {[6, 14, 22].map((yy) => (
          <g key={yy}>
            <circle
              cx={8}
              cy={yy + 0.5}
              r={1}
              fill={rackColor}
            />
            <circle
              cx={12}
              cy={yy + 0.5}
              r={1}
              fill={rackColor}
            />
            <circle
              cx={16}
              cy={yy + 0.5}
              r={1}
              fill={rackColor}
            />
            <circle
              cx={21}
              cy={yy + 0.5}
              r={1.5}
              fill={rackColor}
            />
          </g>
        ))}

        <rect
          x={7}
          y={h - 4}
          width={w - 14}
          height={4}
          fill="white"
          stroke={rackColor}
          strokeWidth={1.5}
        />
      </g>

      {isSelected && (
        <rect
          x={x - 22}
          y={y - 26}
          width={44}
          height={52}
          rx={6}
          fill="none"
          stroke="#0066cc"
          strokeWidth={2}
          strokeDasharray="4,4"
        />
      )}

      <text
        x={x}
        y={y + 31}
        textAnchor="middle"
        fontSize="12"
        fill={rackColor}
        fontWeight="800"
      >
        {label}
      </text>

      <title>
        {rack.name}
        {"\n"}
        {isType2
          ? "Rack Type 2 - Old RACK (Existing)"
          : "Rack Type 1 - New RACK"}
        {"\n"}Status: {rack.status}
        {"\n"}Installation:{" "}
        {rack.installationStatus === "completed"
          ? "Completed"
          : rack.installationStatus ===
            "in_progress"
          ? "In Progress"
          : "Not Started"}
      </title>
    </g>
  );
};

export default RackMarker;
