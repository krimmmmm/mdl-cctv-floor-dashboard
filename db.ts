import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq } from "drizzle-orm";
import {
  cameraStatus,
  rackStatus,
  cabinetStatus,
  activityLog,
  fiberRoutes,
  InsertCameraStatus,
  InsertRackStatus,
  InsertCabinetStatus,
  InsertActivityLog,
  InsertFiberRoute,
} from "../drizzle/schema.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _db: any = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = mysql.createPool(process.env.DATABASE_URL);
      _db = drizzle(pool as any);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ===== Camera Status =====
export async function getAllCameraStatus() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cameraStatus);
}

export async function upsertCameraStatus(data: InsertCameraStatus) {
  const db = await getDb();
  if (!db) return;
  await db.insert(cameraStatus).values(data).onDuplicateKeyUpdate({
    set: {
      status: data.status,
      installationStatus: data.installationStatus,
      wiringUTP: data.wiringUTP,
      wallMountingInstalled: data.wallMountingInstalled,
      domeCameraInstalled: data.domeCameraInstalled,
      x: data.x,
      y: data.y,
      rotation: data.rotation,
    },
  });
}

// ===== Rack Status =====
export async function getAllRackStatus() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rackStatus);
}

export async function upsertRackStatus(data: InsertRackStatus) {
  const db = await getDb();
  if (!db) return;
  await db.insert(rackStatus).values(data).onDuplicateKeyUpdate({
    set: {
      status: data.status,
      installationStatus: data.installationStatus,
      acPower: data.acPower,
      utp: data.utp,
      poeSwitch: data.poeSwitch,
      fiberOptic: data.fiberOptic,
      ready: data.ready,
      x: data.x,
      y: data.y,
    },
  });
}

// ===== Cabinet Status =====
export async function getAllCabinetStatus() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cabinetStatus);
}

export async function upsertCabinetStatus(data: InsertCabinetStatus) {
  const db = await getDb();
  if (!db) return;
  await db.insert(cabinetStatus).values(data).onDuplicateKeyUpdate({
    set: {
      status: data.status,
      installationStatus: data.installationStatus,
      installCabinet: data.installCabinet,
      acPower: data.acPower,
      utp: data.utp,
      poeSwitch: data.poeSwitch,
      fiberOptic: data.fiberOptic,
      ready: data.ready,
      x: data.x,
      y: data.y,
    },
  });
}

// ===== Activity Log =====
export async function getRecentActivityLog(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  const results = await db
    .select()
    .from(activityLog)
    .orderBy(activityLog.createdAt)
    .limit(limit);
  // Return in reverse order (newest first)
  return results.reverse();
}

export async function insertActivityLog(data: InsertActivityLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(activityLog).values(data);
}

// ===== Fiber Routes =====
export async function getAllFiberRoutes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fiberRoutes);
}

export async function upsertFiberRoute(data: InsertFiberRoute) {
  const db = await getDb();
  if (!db) return;
  await db.insert(fiberRoutes).values(data).onDuplicateKeyUpdate({
    set: {
      name: data.name,
      points: data.points,
      status: data.status,
      color: data.color,
    },
  });
}

export async function deleteFiberRoute(routeId: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(fiberRoutes).where(eq(fiberRoutes.routeId, routeId));
}
