
// Activity Log Types
export interface ActivityLog {
  id: string;
  timestamp: number; // Unix timestamp in milliseconds
  userId: string; // User ID or name
  action: string; // e.g., "Camera T1-1 marked as Online"
  equipmentId: string; // Camera, Rack, or Cabinet ID
  equipmentName: string;
  equipmentType: 'camera' | 'rack' | 'cabinet';
  changeType: 'status' | 'position' | 'rotation' | 'installation_step';
  oldValue?: string | number | boolean;
  newValue?: string | number | boolean;
}

export type CameraType = 'type1' | 'type2';
export type CameraStatus = 'idle' | 'wiring_utp' | 'install_wall_mounting' | 'install_dome_camera' | 'online';
export type RackStatus = 'idle' | 'ac_power' | 'utp' | 'poe_switch' | 'fiber_optic' | 'ready' | 'online';
export type CabinetStatus = 'idle' | 'install_cabinet' | 'ac_power' | 'utp' | 'poe_switch' | 'fiber_optic' | 'ready' | 'online';
export type RackType = 'old' | 'new';
export type CabinetType = 'new';
export type InstallationStatus = 'not_started' | 'in_progress' | 'completed';

export interface Camera {
  id: string;
  type: CameraType;
  x: number;
  y: number;
  rotation: number; // Rotation in degrees (0-360)
  status: CameraStatus;
  installationStatus: InstallationStatus; // not_started, in_progress, completed
  name: string;
  wiringUTP: boolean;
  wallMountingInstalled: boolean;
  domeCameraInstalled: boolean;
}

export interface Rack {
  id: string;
  type: RackType;
  x: number;
  y: number;
  status: RackStatus;
  installationStatus: InstallationStatus; // not_started, in_progress, completed
  name: string;
  acPower: boolean;
  utp: boolean;
  poeSwitch: boolean;
  fiberOptic: boolean;
  ready: boolean;
}

export interface Cabinet {
  id: string;
  x: number;
  y: number;
  status: CabinetStatus;
  installationStatus: InstallationStatus; // not_started, in_progress, completed
  name: string;
  installCabinet: boolean;
  acPower: boolean;
  utp: boolean;
  poeSwitch: boolean;
  fiberOptic: boolean;
  ready: boolean;
}

export interface FiberRoute {
  id: string;
  name: string;
  points: Array<{ x: number; y: number }>;
  status: 'idle' | 'active';
  color?: string;
}

// Floor Plan dimensions (in pixels for SVG)
export const FLOOR_PLAN_WIDTH = 1400;
export const FLOOR_PLAN_HEIGHT = 900;

// Type 1 Cameras (27 cameras) - Perimeter/Outdoor - Yellow circles
// Positioned exactly where symbols appear in Master Floor Plan
export const TYPE1_CAMERAS: Camera[] = [
  // Parking Area (4 ตัว)
  { id: 'camera_type1_1', type: 'type1', x: 80, y: 150, rotation: 0, status: 'idle', name: 'Camera T1-1',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type1_2', type: 'type1', x: 80, y: 750, rotation: 0, status: 'idle', name: 'Camera T1-2',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type1_3', type: 'type1', x: 180, y: 150, rotation: 0, status: 'idle', name: 'Camera T1-3',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type1_4', type: 'type1', x: 180, y: 750, rotation: 0, status: 'idle', name: 'Camera T1-4',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },

  // Loading Dock (2 ตัว)
  { id: 'camera_type1_5', type: 'type1', x: 200, y: 400, rotation: 0, status: 'idle', name: 'Camera T1-5',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type1_6', type: 'type1', x: 250, y: 400, rotation: 0, status: 'idle', name: 'Camera T1-6',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },

  // Building Perimeter - Top (5 ตัว)
  { id: 'camera_type1_7', type: 'type1', x: 350, y: 50, rotation: 0, status: 'idle', name: 'Camera T1-7',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type1_8', type: 'type1', x: 600, y: 50, rotation: 0, status: 'idle', name: 'Camera T1-8',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type1_9', type: 'type1', x: 850, y: 50, rotation: 0, status: 'idle', name: 'Camera T1-9',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type1_10', type: 'type1', x: 1050, y: 80, rotation: 0, status: 'idle', name: 'Camera T1-10',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type1_11', type: 'type1', x: 1300, y: 100, rotation: 0, status: 'idle', name: 'Camera T1-11',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },

  // Building Perimeter - Bottom (4 ตัว)
  { id: 'camera_type1_12', type: 'type1', x: 350, y: 850, rotation: 0, status: 'idle', name: 'Camera T1-12',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type1_13', type: 'type1', x: 600, y: 850, rotation: 0, status: 'idle', name: 'Camera T1-13',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type1_14', type: 'type1', x: 850, y: 850, rotation: 0, status: 'idle', name: 'Camera T1-14',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type1_15', type: 'type1', x: 1050, y: 820, rotation: 0, status: 'idle', name: 'Camera T1-15',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },

  // Building Perimeter - Sides (4 ตัว)
  { id: 'camera_type1_16', type: 'type1', x: 250, y: 300, rotation: 0, status: 'idle', name: 'Camera T1-16',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type1_17', type: 'type1', x: 250, y: 600, rotation: 0, status: 'idle', name: 'Camera T1-17',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type1_18', type: 'type1', x: 1100, y: 300, rotation: 0, status: 'idle', name: 'Camera T1-18',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type1_19', type: 'type1', x: 1100, y: 600, rotation: 0, status: 'idle', name: 'Camera T1-19',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },

  // Outdoor Areas (4 ตัว)
  { id: 'camera_type1_20', type: 'type1', x: 1200, y: 200, rotation: 0, status: 'idle', name: 'Camera T1-20',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type1_21', type: 'type1', x: 1300, y: 400, rotation: 0, status: 'idle', name: 'Camera T1-21',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type1_22', type: 'type1', x: 1200, y: 700, rotation: 0, status: 'idle', name: 'Camera T1-22',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type1_23', type: 'type1', x: 1050, y: 750, rotation: 0, status: 'idle', name: 'Camera T1-23',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },

  // Additional Perimeter (3 ตัว)
  { id: 'camera_type1_24', type: 'type1', x: 700, y: 50, rotation: 0, status: 'idle', name: 'Camera T1-24',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type1_25', type: 'type1', x: 700, y: 850, rotation: 0, status: 'idle', name: 'Camera T1-25',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type1_26', type: 'type1', x: 1200, y: 450, rotation: 0, status: 'idle', name: 'Camera T1-26',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type1_27', type: 'type1', x: 400, y: 450, rotation: 0, status: 'idle', name: 'Camera T1-27',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
];

// Type 2 Cameras (37 cameras) - Indoor - Blue squares
// Positioned exactly where symbols appear in Master Floor Plan
export const TYPE2_CAMERAS: Camera[] = [
  // Main Building - Central Area (12 ตัว)
  { id: 'camera_type2_1', type: 'type2', x: 450, y: 200, rotation: 0, status: 'idle', name: 'Camera T2-1',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_2', type: 'type2', x: 500, y: 250, rotation: 0, status: 'idle', name: 'Camera T2-2',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_3', type: 'type2', x: 550, y: 200, rotation: 0, status: 'idle', name: 'Camera T2-3',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_4', type: 'type2', x: 600, y: 250, rotation: 0, status: 'idle', name: 'Camera T2-4',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_5', type: 'type2', x: 650, y: 200, rotation: 0, status: 'idle', name: 'Camera T2-5',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_6', type: 'type2', x: 700, y: 250, rotation: 0, status: 'idle', name: 'Camera T2-6',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_7', type: 'type2', x: 750, y: 200, rotation: 0, status: 'idle', name: 'Camera T2-7',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_8', type: 'type2', x: 450, y: 350, rotation: 0, status: 'idle', name: 'Camera T2-8',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_9', type: 'type2', x: 550, y: 350, rotation: 0, status: 'idle', name: 'Camera T2-9',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_10', type: 'type2', x: 650, y: 350, rotation: 0, status: 'idle', name: 'Camera T2-10',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_11', type: 'type2', x: 750, y: 350, rotation: 0, status: 'idle', name: 'Camera T2-11',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_12', type: 'type2', x: 500, y: 300, rotation: 0, status: 'idle', name: 'Camera T2-12',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },

  // Meeting Rooms & Offices - Top (8 ตัว)
  { id: 'camera_type2_13', type: 'type2', x: 350, y: 150, rotation: 0, status: 'idle', name: 'Camera T2-13',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_14', type: 'type2', x: 400, y: 150, rotation: 0, status: 'idle', name: 'Camera T2-14',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_15', type: 'type2', x: 800, y: 150, rotation: 0, status: 'idle', name: 'Camera T2-15',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_16', type: 'type2', x: 850, y: 150, rotation: 0, status: 'idle', name: 'Camera T2-16',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_17', type: 'type2', x: 900, y: 150, rotation: 0, status: 'idle', name: 'Camera T2-17',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_18', type: 'type2', x: 950, y: 150, rotation: 0, status: 'idle', name: 'Camera T2-18',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_19', type: 'type2', x: 350, y: 200, rotation: 0, status: 'idle', name: 'Camera T2-19',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_20', type: 'type2', x: 900, y: 200, rotation: 0, status: 'idle', name: 'Camera T2-20',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },

  // Meeting Rooms & Offices - Middle (8 ตัว)
  { id: 'camera_type2_21', type: 'type2', x: 350, y: 300, rotation: 0, status: 'idle', name: 'Camera T2-21',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_22', type: 'type2', x: 400, y: 300, rotation: 0, status: 'idle', name: 'Camera T2-22',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_23', type: 'type2', x: 800, y: 300, rotation: 0, status: 'idle', name: 'Camera T2-23',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_24', type: 'type2', x: 850, y: 300, rotation: 0, status: 'idle', name: 'Camera T2-24',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_25', type: 'type2', x: 900, y: 300, rotation: 0, status: 'idle', name: 'Camera T2-25',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_26', type: 'type2', x: 950, y: 300, rotation: 0, status: 'idle', name: 'Camera T2-26',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_27', type: 'type2', x: 350, y: 400, rotation: 0, status: 'idle', name: 'Camera T2-27',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_28', type: 'type2', x: 900, y: 400, rotation: 0, status: 'idle', name: 'Camera T2-28',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },

  // Facility Areas (6 ตัว)
  { id: 'camera_type2_29', type: 'type2', x: 450, y: 500, rotation: 0, status: 'idle', name: 'Camera T2-29',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_30', type: 'type2', x: 550, y: 500, rotation: 0, status: 'idle', name: 'Camera T2-30',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_31', type: 'type2', x: 650, y: 500, rotation: 0, status: 'idle', name: 'Camera T2-31',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_32', type: 'type2', x: 750, y: 500, rotation: 0, status: 'idle', name: 'Camera T2-32',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_33', type: 'type2', x: 500, y: 600, rotation: 0, status: 'idle', name: 'Camera T2-33',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_34', type: 'type2', x: 700, y: 600, rotation: 0, status: 'idle', name: 'Camera T2-34',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },

  // Corridors & Exits (3 ตัว)
  { id: 'camera_type2_35', type: 'type2', x: 400, y: 450, rotation: 0, status: 'idle', name: 'Camera T2-35',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_36', type: 'type2', x: 800, y: 450, rotation: 0, status: 'idle', name: 'Camera T2-36',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
  { id: 'camera_type2_37', type: 'type2', x: 600, y: 550, rotation: 0, status: 'idle', name: 'Camera T2-37',  installationStatus: 'not_started', wiringUTP: false, wallMountingInstalled: false, domeCameraInstalled: false },
];

// RACK Equipment
export const RACKS: Rack[] = [
  // Old RACK (7 units)
  {
    id: 'rack_old_1',
    type: 'old',
    x: 1200,
    y: 400,
    status: 'idle',
    installationStatus: 'not_started',
    name: 'Old RACK 1',
    acPower: false,
    utp: false,
    poeSwitch: false,
    fiberOptic: false,
    ready: false,
  },
  {
    id: 'rack_old_2',
    type: 'old',
    x: 1240,
    y: 400,
    status: 'idle',
    installationStatus: 'not_started',
    name: 'Old RACK 2',
    acPower: false,
    utp: false,
    poeSwitch: false,
    fiberOptic: false,
    ready: false,
  },
  {
    id: 'rack_old_3',
    type: 'old',
    x: 1280,
    y: 400,
    status: 'idle',
    installationStatus: 'not_started',
    name: 'Old RACK 3',
    acPower: false,
    utp: false,
    poeSwitch: false,
    fiberOptic: false,
    ready: false,
  },
  {
    id: 'rack_old_4',
    type: 'old',
    x: 1320,
    y: 400,
    status: 'idle',
    installationStatus: 'not_started',
    name: 'Old RACK 4',
    acPower: false,
    utp: false,
    poeSwitch: false,
    fiberOptic: false,
    ready: false,
  },
  {
    id: 'rack_old_5',
    type: 'old',
    x: 1200,
    y: 450,
    status: 'idle',
    installationStatus: 'not_started',
    name: 'Old RACK 5',
    acPower: false,
    utp: false,
    poeSwitch: false,
    fiberOptic: false,
    ready: false,
  },
  {
    id: 'rack_old_6',
    type: 'old',
    x: 1240,
    y: 450,
    status: 'idle',
    installationStatus: 'not_started',
    name: 'Old RACK 6',
    acPower: false,
    utp: false,
    poeSwitch: false,
    fiberOptic: false,
    ready: false,
  },
  {
    id: 'rack_old_7',
    type: 'old',
    x: 1280,
    y: 450,
    status: 'idle',
    installationStatus: 'not_started',
    name: 'Old RACK 7',
    acPower: false,
    utp: false,
    poeSwitch: false,
    fiberOptic: false,
    ready: false,
  },
  // New RACK (2 units)
  {
    id: 'rack_new_1',
    type: 'new',
    x: 1320,
    y: 450,
    status: 'idle',
    installationStatus: 'not_started',
    name: 'New RACK 1',
    acPower: false,
    utp: false,
    poeSwitch: false,
    fiberOptic: false,
    ready: false,
  },
  {
    id: 'rack_new_2',
    type: 'new',
    x: 1200,
    y: 500,
    status: 'idle',
    installationStatus: 'not_started',
    name: 'New RACK 2',
    acPower: false,
    utp: false,
    poeSwitch: false,
    fiberOptic: false,
    ready: false,
  },
];

// CABINET Equipment
export const CABINETS: Cabinet[] = [
  {
    id: 'cabinet_new_1',
    x: 1240,
    y: 500,
    status: 'idle',
    installationStatus: 'not_started',
    name: 'New CABINET 1',
    installCabinet: false,
    acPower: false,
    utp: false,
    poeSwitch: false,
    fiberOptic: false,
    ready: false,
  },
  {
    id: 'cabinet_new_2',
    x: 1280,
    y: 500,
    status: 'idle',
    installationStatus: 'not_started',
    name: 'New CABINET 2',
    installCabinet: false,
    acPower: false,
    utp: false,
    poeSwitch: false,
    fiberOptic: false,
    ready: false,
  },
];

// Fiber Optic Routes
export const FIBER_ROUTES: FiberRoute[] = [
  {
    id: 'fiber_route_1',
    name: 'Fiber Route 1',
    points: [
      { x: 1250, y: 500 }, // Old RACK
      { x: 1300, y: 650 }, // New RACK
    ],
    status: 'idle',
    color: '#EF4444',
  },
  {
    id: 'fiber_route_2',
    name: 'Fiber Route 2',
    points: [
      { x: 1300, y: 650 }, // New RACK
      { x: 1350, y: 350 }, // Cabinet
    ],
    status: 'idle',
    color: '#EF4444',
  },
  {
    id: 'fiber_route_3',
    name: 'Fiber Route 3',
    points: [
      { x: 1100, y: 400 }, // Building connection point
      { x: 1250, y: 500 }, // Old RACK
    ],
    status: 'idle',
    color: '#EF4444',
  },
];

// Combine all cameras
export const ALL_CAMERAS = [...TYPE1_CAMERAS, ...TYPE2_CAMERAS];

// Initial data exports for context
export const INITIAL_CAMERAS = ALL_CAMERAS;
export const INITIAL_RACKS = RACKS;
export const INITIAL_CABINETS = CABINETS;
export const INITIAL_FIBER_ROUTES = FIBER_ROUTES;
