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

      {/* Camera Number Only */}
      <text
        x={camera.x + 10}
        y={camera.y + 3}
        fontSize="8"
        fill="black"
      >
        {camera.name.replace("Camera ", "")}
      </text>
    </g>
  );
};

export default CameraMarker;
