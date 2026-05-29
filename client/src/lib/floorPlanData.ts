export type Camera = {
  id: string;
  name: string;
  x: number;
  y: number;
  type: "type1" | "type2";
  status: "online" | "offline";
  installationStatus: "not_started" | "in_progress" | "completed";
};

export type Rack = {
  id: string;
  name: string;
  x: number;
  y: number;
  status: "online" | "offline";
  installationStatus: "not_started" | "in_progress" | "completed";
};

export type Cabinet = {
  id: string;
  name: string;
  x: number;
  y: number;
  status: "online" | "offline";
  installationStatus: "not_started" | "in_progress" | "completed";
};

export type FiberRoute = {
  id: string;
  name: string;
  points: { x: number; y: number }[];
  status: string;
  color: string;
};

export const initialCameras: Camera[] = [
  {
    id: "cam-01",
    name: "Camera 01",
    x: 300,
    y: 300,
    type: "type1",
    status: "offline",
    installationStatus: "not_started",
  },
];

export const initialRacks: Rack[] = [
  {
    id: "rack-01",
    name: "Rack 01",
    x: 500,
    y: 350,
    status: "offline",
    installationStatus: "not_started",
  },
];

export const initialCabinets: Cabinet[] = [
  {
    id: "cabinet-01",
    name: "Cabinet 01",
    x: 700,
    y: 400,
    status: "offline",
    installationStatus: "not_started",
  },
];

export const initialFiberRoutes: FiberRoute[] = [];
