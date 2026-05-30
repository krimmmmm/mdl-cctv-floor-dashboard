import React from "react";

const CameraMarker = ({ camera }: any) => {
  const rotation = camera.rotation || 0;

  const installationStatus =
    camera.installationStatus || "not_started";

  const isUrgent = camera.isUrgent || false;

  return (
    <>
      {/* BLINK ANIMATION */}
      <style>
        {`
          @keyframes pulse-yellow {
            0% { opacity: 0.3; }
            50% { opacity: 1; }
            100% { opacity: 0.3; }
          }

          @keyframes pulse-green {
            0% { opacity: 0.3; }
            50% { opacity: 1; }
            100% { opacity: 0.3; }
          }

          @keyframes pulse-pink {
            0% { opacity: 0.2; }
            50% { opacity: 1; }
            100% { opacity: 0.2; }
          }
        `}
      </style>

      <g
        transform={
          "rotate(" +
          rotation +
          " " +
          camera.x +
          " " +
          camera.y +
          ")"
        }
      >
        {/* URGENT OUTER RING */}
        {isUrgent && (
          <circle
            cx={camera.x}
            cy={camera.y - 2}
            r="16"
            fill="none"
            stroke="#ff00cc"
            strokeWidth="4"
            style={{
              animation:
                "pulse-pink 1s infinite",
            }}
          />
        )}

        {/* IN PROGRESS */}
        {installationStatus === "in_progress" && (
          <circle
            cx={camera.x}
            cy={camera.y - 2}
            r="11"
            fill="none"
            stroke="#FFD700"
            strokeWidth="4"
            style={{
              animation:
                "pulse-yellow 1s infinite",
            }}
          />
        )}

        {/* COMPLETED */}
        {installationStatus === "completed" && (
          <circle
            cx={camera.x}
            cy={camera.y - 2}
            r="11"
            fill="none"
            stroke="#00ff66"
            strokeWidth="4"
            style={{
              animation:
                "pulse-green 1s infinite",
            }}
          />
        )}

        {/* TYPE 1 = Yellow + Red */}
        {camera.type === "type1" && (
          <>
            {/* Bottom Red */}
            <path
              d={`
                M ${camera.x - 5} ${camera.y}
                A 5 5 0 0 0 ${camera.x + 5} ${camera.y}
                L ${camera.x + 5} ${camera.y - 5}
                L ${camera.x - 5} ${camera.y - 5}
                Z
              `}
              fill="red"
              stroke="red"
            />

            {/* Top Yellow */}
            <rect
              x={camera.x - 5}
              y={camera.y - 5}
              width="10"
              height="5"
              fill="yellow"
            />
          </>
        )}

        {/* TYPE 2 = Yellow + Blue */}
        {camera.type === "type2" && (
          <>
            {/* Bottom Blue */}
            <path
              d={`
                M ${camera.x - 5} ${camera.y}
                A 5 5 0 0 0 ${camera.x + 5} ${camera.y}
                L ${camera.x + 5} ${camera.y - 5}
                L ${camera.x - 5} ${camera.y - 5}
                Z
              `}
              fill="#3F48CC"
              stroke="#3F48CC"
            />

            {/* Top Yellow */}
            <rect
              x={camera.x - 5}
              y={camera.y - 5}
              width="10"
              height="5"
              fill="yellow"
            />
          </>
        )}

        {/* Camera Number */}
        <text
          x={camera.x + 10}
          y={camera.y + 3}
          fontSize="8"
          fill="black"
        >
          {camera.name.replace("Camera ", "")}
        </text>
      </g>
    </>
  );
};

export default CameraMarker;
