import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User profiles for skincare app
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Skin analysis data
export const skinAnalyses = pgTable("skin_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  skinType: text("skin_type").notNull(), // oily, dry, combination, sensitive
  concerns: text("concerns").array().notNull(), // acne, dark_spots, wrinkles, dullness, redness
  allergies: text("allergies").array().default([]),
  imageUrl: text("image_url"),
  aiDiagnosis: jsonb("ai_diagnosis"), // AI analysis results
  createdAt: timestamp("created_at").defaultNow(),
});

// Personalized routines
export const routines = pgTable("routines", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  analysisId: integer("analysis_id").references(() => skinAnalyses.id).notNull(),
  routineType: text("routine_type").notNull(), // morning, evening
  products: jsonb("products").notNull(), // Array of product recommendations
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages with AI advisor
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  isUserMessage: boolean("is_user_message").notNull(),
  imageUrl: text("image_url"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Skin diary entries
export const diaryEntries = pgTable("diary_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  photoUrl: text("photo_url"),
  mood: text("mood"), // good, neutral, bad
  condition: text("condition"), // clear, breakout, dry, oily
  notes: text("notes"),
  date: timestamp("date").defaultNow(),
});

// User reminders
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  frequency: text("frequency").notNull(), // daily, every_2h, weekly
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
});

export const insertSkinAnalysisSchema = createInsertSchema(skinAnalyses).pick({
  userId: true,
  skinType: true,
  concerns: true,
  allergies: true,
  imageUrl: true,
  aiDiagnosis: true,
});

export const insertRoutineSchema = createInsertSchema(routines).pick({
  userId: true,
  analysisId: true,
  routineType: true,
  products: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  userId: true,
  message: true,
  isUserMessage: true,
  imageUrl: true,
});

export const insertDiaryEntrySchema = createInsertSchema(diaryEntries).pick({
  userId: true,
  photoUrl: true,
  mood: true,
  condition: true,
  notes: true,
});

export const insertReminderSchema = createInsertSchema(reminders).pick({
  userId: true,
  title: true,
  frequency: true,
  isActive: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SkinAnalysis = typeof skinAnalyses.$inferSelect;
export type InsertSkinAnalysis = z.infer<typeof insertSkinAnalysisSchema>;
export type Routine = typeof routines.$inferSelect;
export type InsertRoutine = z.infer<typeof insertRoutineSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type DiaryEntry = typeof diaryEntries.$inferSelect;
export type InsertDiaryEntry = z.infer<typeof insertDiaryEntrySchema>;
export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;

// Onboarding form schema
export const onboardingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  skinType: z.enum(["oily", "dry", "combination", "sensitive"]),
  concerns: z.array(z.enum(["acne", "dark_spots", "wrinkles", "dullness", "redness"])).min(1, "Select at least one concern"),
  allergies: z.array(z.string()).default([]),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;

// AI diagnosis response
export const aiDiagnosisSchema = z.object({
  severity: z.enum(["mild", "moderate", "severe"]),
  primaryConcerns: z.array(z.string()),
  recommendations: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

export type AIDiagnosis = z.infer<typeof aiDiagnosisSchema>;
