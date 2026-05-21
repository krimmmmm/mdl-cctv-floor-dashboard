import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";

// Mock the db module
vi.mock("./db.js", () => ({
  getAllCameraStatus: vi.fn().mockResolvedValue([]),
  upsertCameraStatus: vi.fn().mockResolvedValue(undefined),
  getAllRackStatus: vi.fn().mockResolvedValue([]),
  upsertRackStatus: vi.fn().mockResolvedValue(undefined),
  getAllCabinetStatus: vi.fn().mockResolvedValue([]),
  upsertCabinetStatus: vi.fn().mockResolvedValue(undefined),
  getRecentActivityLog: vi.fn().mockResolvedValue([]),
  insertActivityLog: vi.fn().mockResolvedValue(undefined),
  getAllFiberRoutes: vi.fn().mockResolvedValue([]),
  upsertFiberRoute: vi.fn().mockResolvedValue(undefined),
  deleteFiberRoute: vi.fn().mockResolvedValue(undefined),
}));

import * as db from "./db.js";

function createCtx() {
  return {
    req: {} as any,
    res: {} as any,
  };
}

describe("camera procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("camera.getAll returns empty array when no data", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.camera.getAll();
    expect(result).toEqual([]);
    expect(db.getAllCameraStatus).toHaveBeenCalledOnce();
  });

  it("camera.upsert calls upsertCameraStatus with correct data", async () => {
    const caller = appRouter.createCaller(createCtx());
    const input = {
      cameraId: "camera_type1_1",
      status: "online",
      installationStatus: "completed" as const,
      wiringUTP: true,
      wallMountingInstalled: true,
      domeCameraInstalled: true,
      x: 100,
      y: 200,
      rotation: 90,
    };
    const result = await caller.camera.upsert(input);
    expect(result).toEqual({ success: true });
    expect(db.upsertCameraStatus).toHaveBeenCalledWith(input);
  });
});

describe("rack procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rack.getAll returns empty array when no data", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.rack.getAll();
    expect(result).toEqual([]);
  });

  it("rack.upsert calls upsertRackStatus with correct data", async () => {
    const caller = appRouter.createCaller(createCtx());
    const input = {
      rackId: "rack_old_1",
      status: "idle",
      installationStatus: "in_progress" as const,
      acPower: true,
      utp: false,
      poeSwitch: false,
      fiberOptic: false,
      ready: false,
      x: 50,
      y: 60,
    };
    const result = await caller.rack.upsert(input);
    expect(result).toEqual({ success: true });
    expect(db.upsertRackStatus).toHaveBeenCalledWith(input);
  });
});

describe("cabinet procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cabinet.getAll returns empty array when no data", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.cabinet.getAll();
    expect(result).toEqual([]);
  });

  it("cabinet.upsert calls upsertCabinetStatus with correct data", async () => {
    const caller = appRouter.createCaller(createCtx());
    const input = {
      cabinetId: "cabinet_1",
      status: "idle",
      installationStatus: "not_started" as const,
      installCabinet: false,
      acPower: false,
      utp: false,
      poeSwitch: false,
      fiberOptic: false,
      ready: false,
      x: 10,
      y: 20,
    };
    const result = await caller.cabinet.upsert(input);
    expect(result).toEqual({ success: true });
    expect(db.upsertCabinetStatus).toHaveBeenCalledWith(input);
  });
});

describe("fiber procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fiber.getAll returns empty array when no data", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.fiber.getAll();
    expect(result).toEqual([]);
    expect(db.getAllFiberRoutes).toHaveBeenCalledOnce();
  });

  it("fiber.upsert saves route with correct data", async () => {
    const caller = appRouter.createCaller(createCtx());
    const input = {
      routeId: "fiber_123",
      name: "Fiber Route 1",
      points: JSON.stringify([{ x: 100, y: 200 }, { x: 300, y: 400 }]),
      status: "active" as const,
      color: "#EF4444",
    };
    const result = await caller.fiber.upsert(input);
    expect(result).toEqual({ success: true });
    expect(db.upsertFiberRoute).toHaveBeenCalledWith({
      routeId: input.routeId,
      name: input.name,
      points: input.points,
      status: "active",
      color: "#EF4444",
    });
  });

  it("fiber.delete removes route by routeId", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.fiber.delete({ routeId: "fiber_123" });
    expect(result).toEqual({ success: true });
    expect(db.deleteFiberRoute).toHaveBeenCalledWith("fiber_123");
  });
});

describe("activityLog procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("activityLog.getRecent returns empty array when no data", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.activityLog.getRecent({ limit: 10 });
    expect(result).toEqual([]);
    expect(db.getRecentActivityLog).toHaveBeenCalledWith(10);
  });

  it("activityLog.insert calls insertActivityLog with correct data", async () => {
    const caller = appRouter.createCaller(createCtx());
    const input = {
      equipmentId: "camera_type1_1",
      equipmentName: "Camera T1-1",
      equipmentType: "camera" as const,
      changeType: "installation_step" as const,
      action: "Wiring UTP: enabled",
      oldValue: "false",
      newValue: "true",
    };
    const result = await caller.activityLog.insert(input);
    expect(result).toEqual({ success: true });
    expect(db.insertActivityLog).toHaveBeenCalledWith(input);
  });
});
