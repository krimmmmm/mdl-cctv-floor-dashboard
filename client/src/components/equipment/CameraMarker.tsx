import React from 'react';

const CameraMarker = ({ camera }: any) => {
  return (
    <g>
      <circle
        cx={camera.x}
        cy={camera.y}
        r="10"
        fill="red"
      />
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
