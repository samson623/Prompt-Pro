import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  currentPlan: varchar("current_plan").default("free"),
  promptsUsed: integer("prompts_used").default(0),
  promptsLimit: integer("prompts_limit").default(10),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const prompts = pgTable("prompts", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  originalPrompt: text("original_prompt").notNull(),
  enhancedPrompt: text("enhanced_prompt").notNull(),
  questionnaireData: jsonb("questionnaire_data"),
  enhancementOptions: jsonb("enhancement_options"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const questionnaires = pgTable("questionnaires", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  originalPrompt: text("original_prompt").notNull(),
  questions: jsonb("questions").notNull(),
  answers: jsonb("answers"),
  status: varchar("status").default("pending"), // pending, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertPromptSchema = createInsertSchema(prompts).omit({
  id: true,
  createdAt: true,
});
export type InsertPrompt = z.infer<typeof insertPromptSchema>;

export const insertQuestionnaireSchema = createInsertSchema(questionnaires).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertQuestionnaire = z.infer<typeof insertQuestionnaireSchema>;

export const enhancementOptionsSchema = z.object({
  variations: z.number().min(1).max(10).default(3),
  style: z.enum(["default", "professional", "casual", "technical"]).default("default"),
  format: z.enum(["default", "structured", "conversational", "directive"]).default("default"),
  length: z.enum(["default", "brief", "detailed", "comprehensive"]).default("default"),
  constraints: z.object({
    statistics: z.boolean().default(false),
    examples: z.boolean().default(false),
    balanced: z.boolean().default(false),
    citations: z.boolean().default(false),
    stepByStep: z.boolean().default(false),
    avoidJargon: z.boolean().default(false),
  }).default({}),
  customInstructions: z.string().optional(),
});

export type EnhancementOptions = z.infer<typeof enhancementOptionsSchema>;
