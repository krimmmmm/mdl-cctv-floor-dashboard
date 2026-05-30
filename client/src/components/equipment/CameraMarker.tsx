import React from "react";

const CameraMarker = ({ camera }: any) => {
  return (
    <g>
      {/* TYPE 1 = Yellow + Red */}
      {camera.type === "type1" && (
        <>
          {/* Bottom Red */}
          <path
            d={`
              M ${camera.x - 10} ${camera.y}
              A 10 10 0 0 0 ${camera.x + 10} ${camera.y}
              L ${camera.x + 10} ${camera.y - 10}
              L ${camera.x - 10} ${camera.y - 10}
              Z
            `}
            fill="red"
            stroke="red"
          />

          {/* Top Yellow */}
          <rect
            x={camera.x - 10}
            y={camera.y - 10}
            width="20"
            height="10"
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
              M ${camera.x - 10} ${camera.y}
              A 10 10 0 0 0 ${camera.x + 10} ${camera.y}
              L ${camera.x + 10} ${camera.y - 10}
              L ${camera.x - 10} ${camera.y - 10}
              Z
            `}
            fill="#3F48CC"
            stroke="#3F48CC"
          />

          {/* Top Yellow */}
          <rect
            x={camera.x - 10}
            y={camera.y - 10}
            width="20"
            height="10"
            fill="yellow"
          />
        </>
      )}

      {/* Camera Label */}
      <text
        x={camera.x + 15}
        y={camera.y}
        fontSize="12"
        fill="black"
      >
        {camera.name}
      </text>
    </g>
  );
};

export default CameraMarker;
