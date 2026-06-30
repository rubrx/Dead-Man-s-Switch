import { pgTable, text, timestamp, uuid, integer, pgEnum, boolean } from "drizzle-orm/pg-core";

export const switchStatusEnum = pgEnum("switch_status", ["active", "sent", "cancelled"]);
export const reminderTypeEnum = pgEnum("reminder_type", ["7_day", "1_day", "final"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const magicLinks = pgTable("magic_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const switches = pgTable("switches", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  title: text("title").notNull(),
  recipientEmail: text("recipient_email").notNull(),

  // The message body is encrypted before it ever hits the DB (handled in app code, not here)
  encryptedMessage: text("encrypted_message").notNull(),

  // How long the switch waits between check-ins, in days (e.g. 30)
  intervalDays: integer("interval_days").notNull(),

  // The actual deadline — recalculated every time the user checks in
  deadline: timestamp("deadline").notNull(),

  status: switchStatusEnum("status").default("active").notNull(),

  // Unguessable token used in check-in email links — not the same as a login session
  checkinToken: text("checkin_token").notNull().unique(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  sentAt: timestamp("sent_at"),
});

export const checkinLog = pgTable("checkin_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  switchId: uuid("switch_id").notNull().references(() => switches.id, { onDelete: "cascade" }),
  checkedInAt: timestamp("checked_in_at").defaultNow().notNull(),
  method: text("method").notNull(), // "email_link" | "dashboard"
});

export const reminderLog = pgTable("reminder_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  switchId: uuid("switch_id").notNull().references(() => switches.id, { onDelete: "cascade" }),
  type: reminderTypeEnum("type").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});