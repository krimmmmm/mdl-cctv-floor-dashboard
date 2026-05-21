import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar, float } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Camera status table - stores installation status for each camera
 */
export const cameraStatus = mysqlTable("camera_status", {
  id: int("id").autoincrement().primaryKey(),
  cameraId: varchar("cameraId", { length: 64 }).notNull().unique(),
  status: varchar("status", { length: 64 }).notNull().default("idle"),
  installationStatus: mysqlEnum("installationStatus", ["not_started", "in_progress", "completed"]).notNull().default("not_started"),
  wiringUTP: boolean("wiringUTP").notNull().default(false),
  wallMountingInstalled: boolean("wallMountingInstalled").notNull().default(false),
  domeCameraInstalled: boolean("domeCameraInstalled").notNull().default(false),
  x: float("x").notNull().default(0),
  y: float("y").notNull().default(0),
  rotation: float("rotation").notNull().default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CameraStatusRow = typeof cameraStatus.$inferSelect;
export type InsertCameraStatus = typeof cameraStatus.$inferInsert;

/**
 * Rack status table - stores installation status for each rack
 */
export const rackStatus = mysqlTable("rack_status", {
  id: int("id").autoincrement().primaryKey(),
  rackId: varchar("rackId", { length: 64 }).notNull().unique(),
  status: varchar("status", { length: 64 }).notNull().default("idle"),
  installationStatus: mysqlEnum("installationStatus", ["not_started", "in_progress", "completed"]).notNull().default("not_started"),
  acPower: boolean("acPower").notNull().default(false),
  utp: boolean("utp").notNull().default(false),
  poeSwitch: boolean("poeSwitch").notNull().default(false),
  fiberOptic: boolean("fiberOptic").notNull().default(false),
  ready: boolean("ready").notNull().default(false),
  x: float("x").notNull().default(0),
  y: float("y").notNull().default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RackStatusRow = typeof rackStatus.$inferSelect;
export type InsertRackStatus = typeof rackStatus.$inferInsert;

/**
 * Cabinet status table - stores installation status for each cabinet
 */
export const cabinetStatus = mysqlTable("cabinet_status", {
  id: int("id").autoincrement().primaryKey(),
  cabinetId: varchar("cabinetId", { length: 64 }).notNull().unique(),
  status: varchar("status", { length: 64 }).notNull().default("idle"),
  installationStatus: mysqlEnum("installationStatus", ["not_started", "in_progress", "completed"]).notNull().default("not_started"),
  installCabinet: boolean("installCabinet").notNull().default(false),
  acPower: boolean("acPower").notNull().default(false),
  utp: boolean("utp").notNull().default(false),
  poeSwitch: boolean("poeSwitch").notNull().default(false),
  fiberOptic: boolean("fiberOptic").notNull().default(false),
  ready: boolean("ready").notNull().default(false),
  x: float("x").notNull().default(0),
  y: float("y").notNull().default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CabinetStatusRow = typeof cabinetStatus.$inferSelect;
export type InsertCabinetStatus = typeof cabinetStatus.$inferInsert;

/**
 * Activity log table - stores all change events
 */
export const activityLog = mysqlTable("activity_log", {
  id: int("id").autoincrement().primaryKey(),
  equipmentId: varchar("equipmentId", { length: 64 }).notNull(),
  equipmentName: varchar("equipmentName", { length: 128 }).notNull(),
  equipmentType: mysqlEnum("equipmentType", ["camera", "rack", "cabinet"]).notNull(),
  changeType: mysqlEnum("changeType", ["status", "position", "rotation", "installation_step"]).notNull(),
  action: text("action").notNull(),
  oldValue: text("oldValue"),
  newValue: text("newValue"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLogRow = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;

/**
 * Fiber routes table - stores user-drawn fiber optic routes
 */
export const fiberRoutes = mysqlTable("fiber_routes", {
  id: int("id").autoincrement().primaryKey(),
  routeId: varchar("routeId", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  points: text("points").notNull(), // JSON array of {x, y} points
  status: mysqlEnum("status", ["active", "inactive"]).notNull().default("active"),
  color: varchar("color", { length: 32 }).notNull().default("#EF4444"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FiberRouteRow = typeof fiberRoutes.$inferSelect;
export type InsertFiberRoute = typeof fiberRoutes.$inferInsert;
