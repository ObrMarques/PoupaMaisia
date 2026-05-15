import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cardsTable = pgTable("cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  lastFourDigits: text("last_four_digits").notNull(),
  brand: text("brand").notNull().default("visa"), // visa | mastercard | elo | amex | hipercard | other
  limit: numeric("limit", { precision: 12, scale: 2 }).notNull(),
  currentBalance: numeric("current_balance", { precision: 12, scale: 2 }).notNull().default("0"),
  closingDay: integer("closing_day").notNull(),
  dueDay: integer("due_day").notNull(),
  color: text("color").notNull().default("#1A1A1A"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCardSchema = createInsertSchema(cardsTable).omit({ id: true, createdAt: true });
export type InsertCard = z.infer<typeof insertCardSchema>;
export type Card = typeof cardsTable.$inferSelect;
