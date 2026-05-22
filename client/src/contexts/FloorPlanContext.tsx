import React, { createContext, useContext } from "react";

const FloorPlanContext = createContext({});

export const FloorPlanProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <FloorPlanContext.Provider value={{}}>
      {children}
    </FloorPlanContext.Provider>
  );
};

export const useFloorPlan = () => useContext(FloorPlanContext);
