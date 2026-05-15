import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const aiConversationsTable = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull().default("Nova conversa"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const aiMessagesTable = pgTable("ai_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  role: text("role").notNull(), // user | assistant
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAiConversationSchema = createInsertSchema(aiConversationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiMessageSchema = createInsertSchema(aiMessagesTable).omit({ id: true, createdAt: true });
export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;
export type InsertAiMessage = z.infer<typeof insertAiMessageSchema>;
export type AiConversation = typeof aiConversationsTable.$inferSelect;
export type AiMessage = typeof aiMessagesTable.$inferSelect;
