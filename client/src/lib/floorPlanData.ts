export type Camera = {
  id: string;
  name: string;
  x: number;
  y: number;

  type: "type1" | "type2";

  status:
    | "online"
    | "offline"
    | "idle";

  installationStatus:
    | "not_started"
    | "in_progress"
    | "completed";

  rotation?: number;

  isUrgent?: boolean;

  wiringUTP?: boolean;
  wallMountingInstalled?: boolean;
  domeCameraInstalled?: boolean;

  wiringUTPProgress?: number;
  wallMountingProgress?: number;
  domeCameraProgress?: number;

  photo1?: string;
  photo2?: string;
  photo3?: string;
  photo4?: string;
};

export type Rack = {
  id: string;
  name: string;
  x: number;
  y: number;

  type?: string;

  status:
    | "online"
    | "offline"
    | "idle";

  installationStatus:
    | "not_started"
    | "in_progress"
    | "completed";

  isUrgent?: boolean;

  acPower?: boolean;
  utp?: boolean;
  poeSwitch?: boolean;
  fiberOptic?: boolean;
  ready?: boolean;

  acPowerProgress?: number;
  utpProgress?: number;
  poeSwitchProgress?: number;
  fiberOpticProgress?: number;
  readyProgress?: number;

  photo1?: string;
  photo2?: string;
  photo3?: string;
  photo4?: string;
};

export type Cabinet = {
  id: string;
  name: string;
  x: number;
  y: number;

  type?: string;

  status:
    | "online"
    | "offline"
    | "idle";

  installationStatus:
    | "not_started"
    | "in_progress"
    | "completed";

  isUrgent?: boolean;

  installCabinet?: boolean;
  acPower?: boolean;
  utp?: boolean;
  poeSwitch?: boolean;
  fiberOptic?: boolean;
  ready?: boolean;

  installCabinetProgress?: number;
  acPowerProgress?: number;
  utpProgress?: number;
  poeSwitchProgress?: number;
  fiberOpticProgress?: number;
  readyProgress?: number;

  photo1?: string;
  photo2?: string;
  photo3?: string;
  photo4?: string;
};

export type FiberRoute = {
  id: string;
  name: string;
  points: {
    x: number;
    y: number;
  }[];

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

    rotation: 0,

    isUrgent: false,

    wiringUTP: false,
    wallMountingInstalled: false,
    domeCameraInstalled: false,

    wiringUTPProgress: 0,
    wallMountingProgress: 0,
    domeCameraProgress: 0,

    photo1: "",
    photo2: "",
    photo3: "",
    photo4: "",
  },
];

export const initialRacks: Rack[] = [
  {
    id: "rack-01",
    name: "Rack 01",
    x: 500,
    y: 350,

    type: "type1",

    status: "offline",
    installationStatus: "not_started",

    isUrgent: false,

    acPower: false,
    utp: false,
    poeSwitch: false,
    fiberOptic: false,
    ready: false,

    acPowerProgress: 0,
    utpProgress: 0,
    poeSwitchProgress: 0,
    fiberOpticProgress: 0,
    readyProgress: 0,

    photo1: "",
    photo2: "",
    photo3: "",
    photo4: "",
  },
];

export const initialCabinets: Cabinet[] = [
  {
    id: "cabinet-01",
    name: "Cabinet 01",
    x: 700,
    y: 400,

    type: "type1",

    status: "offline",
    installationStatus: "not_started",

    isUrgent: false,

    installCabinet: false,
    acPower: false,
    utp: false,
    poeSwitch: false,
    fiberOptic: false,
    ready: false,

    installCabinetProgress: 0,
    acPowerProgress: 0,
    utpProgress: 0,
    poeSwitchProgress: 0,
    fiberOpticProgress: 0,
    readyProgress: 0,

    photo1: "",
    photo2: "",
    photo3: "",
    photo4: "",
  },
];

export const initialFiberRoutes: FiberRoute[] =
  [];
