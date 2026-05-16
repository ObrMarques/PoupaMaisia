import { pgTable, text, serial, integer, numeric, boolean, timestamp, date, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  date: date("date").notNull(),
  time: text("time"),
  categoryId: integer("category_id").notNull(),
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurringPeriod: text("recurring_period"),
  installments: integer("installments"),
  installmentNumber: integer("installment_number"),
  cardId: integer("card_id"),
  walletId: integer("wallet_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_transactions_user_id").on(table.userId),
  index("idx_transactions_user_date").on(table.userId, table.date),
  index("idx_transactions_user_type").on(table.userId, table.type),
  index("idx_transactions_date_desc").on(table.date),
]);

export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({ id: true, createdAt: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;
