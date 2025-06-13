import {
  users,
  prompts,
  questionnaires,
  type User,
  type UpsertUser,
  type InsertPrompt,
  type InsertQuestionnaire,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Prompt operations
  createPrompt(prompt: InsertPrompt): Promise<{ id: string }>;
  getUserPrompts(userId: string, limit?: number): Promise<any[]>;
  
  // Questionnaire operations
  createQuestionnaire(questionnaire: InsertQuestionnaire): Promise<{ id: string }>;
  updateQuestionnaire(id: string, data: Partial<InsertQuestionnaire>): Promise<void>;
  getQuestionnaire(id: string): Promise<any>;
  
  // Usage tracking
  incrementUserUsage(userId: string): Promise<boolean>;
  resetUserUsage(userId: string): Promise<void>;
  updateUserPlan(userId: string, plan: string, promptsLimit: number): Promise<User>;
  
  // Stripe operations
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createPrompt(prompt: InsertPrompt): Promise<{ id: string }> {
    const id = crypto.randomUUID();
    await db.insert(prompts).values({ ...prompt, id });
    return { id };
  }

  async getUserPrompts(userId: string, limit = 10): Promise<any[]> {
    return await db
      .select()
      .from(prompts)
      .where(eq(prompts.userId, userId))
      .orderBy(desc(prompts.createdAt))
      .limit(limit);
  }

  async createQuestionnaire(questionnaire: InsertQuestionnaire): Promise<{ id: string }> {
    const id = crypto.randomUUID();
    await db.insert(questionnaires).values({ ...questionnaire, id });
    return { id };
  }

  async updateQuestionnaire(id: string, data: Partial<InsertQuestionnaire>): Promise<void> {
    await db
      .update(questionnaires)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(questionnaires.id, id));
  }

  async getQuestionnaire(id: string): Promise<any> {
    const [questionnaire] = await db
      .select()
      .from(questionnaires)
      .where(eq(questionnaires.id, id));
    return questionnaire;
  }

  async incrementUserUsage(userId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || user.promptsUsed >= user.promptsLimit) {
      return false;
    }

    await db
      .update(users)
      .set({ 
        promptsUsed: user.promptsUsed + 1,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    return true;
  }

  async resetUserUsage(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        promptsUsed: 0,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async updateUserPlan(userId: string, plan: string, promptsLimit: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        currentPlan: plan,
        promptsLimit,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId,
        stripeSubscriptionId,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
