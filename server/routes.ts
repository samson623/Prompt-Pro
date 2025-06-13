import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import express from "express";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { enhancementOptionsSchema } from "@shared/schema";
import { z } from "zod";

// Check for API keys with graceful fallbacks for preview mode
const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;
const hasOpenRouterKey = !!process.env.OPENROUTER_API_KEY;

const stripe = hasStripeKey ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
}) : null;

const PLAN_CONFIGS = {
  free: { promptsLimit: 10, price: 0 },
  basic: { promptsLimit: 75, price: 100 }, // $1.00 in cents
  plus: { promptsLimit: 300, price: 300 }, // $3.00 in cents
  pro: { promptsLimit: 500, price: 500 }, // $5.00 in cents
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Generate AI questions for prompt enhancement
  app.post('/api/generate-questions', isAuthenticated, async (req: any, res) => {
    try {
      const { originalPrompt, enhancementOptions } = req.body;
      const userId = req.user.claims.sub;

      // Validate enhancement options
      const validatedOptions = enhancementOptionsSchema.parse(enhancementOptions);

      // Create questionnaire entry
      const questionnaire = await storage.createQuestionnaire({
        userId,
        originalPrompt,
        questions: [], // Will be populated by AI
        status: "pending",
      });

      let questions;

      if (hasOpenRouterKey) {
        try {
          // Generate questions using OpenRouter API
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'mistralai/mistral-7b-instruct',
              messages: [
                {
                  role: 'system',
                  content: `You are an AI assistant that generates clarifying questions to enhance user prompts. 
                  Generate 3-5 specific, contextual questions that will help improve the given prompt. 
                  Return the response as a JSON array of question objects with "id", "question", "type" (multiple-choice, text, or boolean), and "options" (for multiple-choice questions).
                  
                  Enhancement preferences: ${JSON.stringify(validatedOptions)}
                  
                  Make questions specific to the prompt content and purpose.`
                },
                {
                  role: 'user',
                  content: `Original prompt: "${originalPrompt}"\n\nGenerate clarifying questions to enhance this prompt.`
                }
              ],
              max_tokens: 1000,
              temperature: 0.7,
            }),
          });

          if (response.ok) {
            const aiResponse = await response.json();
            questions = JSON.parse(aiResponse.choices[0].message.content);
          }
        } catch (apiError) {
          console.log("OpenRouter API not available, using fallback questions");
        }
      }

      // Fallback questions for preview mode or API failures
      if (!questions) {
        questions = [
          {
            id: "purpose",
            question: "What is the primary purpose of this task?",
            type: "multiple-choice",
            options: ["Problem solving", "Creative writing", "Analysis", "Code development", "Other"]
          },
          {
            id: "audience",
            question: "Who is the target audience?",
            type: "multiple-choice",
            options: ["Beginners", "Intermediate", "Experts", "General audience"]
          },
          {
            id: "context",
            question: "What additional context would be helpful?",
            type: "text"
          }
        ];
      }

      // Update questionnaire with generated questions
      await storage.updateQuestionnaire(questionnaire.id, { questions });

      res.json({ 
        questionnaireId: questionnaire.id,
        questions 
      });

    } catch (error) {
      console.error("Error generating questions:", error);
      res.status(500).json({ message: "Failed to generate questions" });
    }
  });

  // Submit questionnaire answers and generate enhanced prompt
  app.post('/api/enhance-prompt', isAuthenticated, async (req: any, res) => {
    try {
      const { questionnaireId, answers } = req.body;
      const userId = req.user.claims.sub;

      // Check usage limits
      const canUse = await storage.incrementUserUsage(userId);
      if (!canUse) {
        return res.status(403).json({ message: "Usage limit reached. Please upgrade your plan." });
      }

      // Get questionnaire
      const questionnaire = await storage.getQuestionnaire(questionnaireId);
      if (!questionnaire || questionnaire.userId !== userId) {
        return res.status(404).json({ message: "Questionnaire not found" });
      }

      // Update questionnaire with answers
      await storage.updateQuestionnaire(questionnaireId, { 
        answers,
        status: "completed"
      });

      let enhancedPrompt;

      if (hasOpenRouterKey) {
        try {
          // Generate enhanced prompt using OpenRouter API
          const enhanceResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'mistralai/mistral-7b-instruct',
              messages: [
                {
                  role: 'system',
                  content: `You are an expert prompt engineer. Enhance the given prompt based on the questionnaire answers. 
                  Create a detailed, well-structured prompt that incorporates all the context and requirements.
                  Return only the enhanced prompt text, no additional formatting or explanation.`
                },
                {
                  role: 'user',
                  content: `Original prompt: "${questionnaire.originalPrompt}"
                  
                  Questionnaire Q&A:
                  ${questionnaire.questions.map((q: any, i: number) => 
                    `Q: ${q.question}\nA: ${answers[i] || 'Not answered'}`
                  ).join('\n\n')}
                  
                  Please enhance this prompt based on the answers provided.`
                }
              ],
              max_tokens: 2000,
              temperature: 0.3,
            }),
          });

          if (enhanceResponse.ok) {
            const enhanceResult = await enhanceResponse.json();
            enhancedPrompt = enhanceResult.choices[0].message.content.trim();
          }
        } catch (apiError) {
          console.log("OpenRouter API not available, using enhanced fallback");
        }
      }

      // Fallback enhanced prompt for preview mode
      if (!enhancedPrompt) {
        const qaContext = questionnaire.questions.map((q: any, i: number) => 
          `${q.question}: ${answers[i] || 'Not specified'}`
        ).join('. ');
        
        enhancedPrompt = `Enhanced version of your prompt: "${questionnaire.originalPrompt}"

Based on your answers (${qaContext}), here's a refined prompt that provides better context and specificity:

You are a Senior Software Engineer specializing in Web Apps. ${questionnaire.originalPrompt}

Please provide a detailed, step-by-step response that considers the specific context and requirements mentioned. Include practical examples where relevant and ensure the solution is production-ready.`;
      }

      // Save the enhanced prompt
      await storage.createPrompt({
        userId,
        originalPrompt: questionnaire.originalPrompt,
        enhancedPrompt,
        questionnaireData: { questions: questionnaire.questions, answers },
        enhancementOptions: req.body.enhancementOptions || {},
      });

      res.json({ 
        enhancedPrompt,
        originalPrompt: questionnaire.originalPrompt
      });

    } catch (error) {
      console.error("Error enhancing prompt:", error);
      res.status(500).json({ message: "Failed to enhance prompt" });
    }
  });

  // Get user's prompt history
  app.get('/api/prompts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const prompts = await storage.getUserPrompts(userId, 20);
      res.json(prompts);
    } catch (error) {
      console.error("Error fetching prompts:", error);
      res.status(500).json({ message: "Failed to fetch prompts" });
    }
  });

  // Create subscription
  app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const { plan } = req.body;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user || !user.email) {
        return res.status(400).json({ message: "User email required" });
      }

      if (!PLAN_CONFIGS[plan as keyof typeof PLAN_CONFIGS]) {
        return res.status(400).json({ message: "Invalid plan" });
      }

      const planConfig = PLAN_CONFIGS[plan as keyof typeof PLAN_CONFIGS];

      // Preview mode without Stripe
      if (!hasStripeKey) {
        await storage.updateUserPlan(userId, plan, planConfig.promptsLimit);
        return res.json({
          subscriptionId: "preview_subscription_" + Date.now(),
          clientSecret: "preview_client_secret_" + Date.now(),
          success: true,
          message: "Preview mode - subscription would be created with real Stripe keys"
        });
      }

      if (user.stripeSubscriptionId) {
        const subscription = await stripe!.subscriptions.retrieve(user.stripeSubscriptionId);
        const latestInvoice = subscription.latest_invoice;
        const paymentIntent = typeof latestInvoice === 'object' && latestInvoice !== null ? 
          (latestInvoice as any).payment_intent : null;
        
        res.json({
          subscriptionId: subscription.id,
          clientSecret: paymentIntent?.client_secret,
        });
        return;
      }

      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe!.customers.create({
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        });
        customerId = customer.id;
      }

      const subscription = await stripe!.subscriptions.create({
        customer: customerId,
        items: [{
          price_data: {
            currency: 'usd',
            product: {
              name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
              description: `${planConfig.promptsLimit} prompts per month`,
            },
            unit_amount: planConfig.price,
            recurring: {
              interval: 'month',
            },
          },
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.updateUserStripeInfo(userId, customerId, subscription.id);
      await storage.updateUserPlan(userId, plan, planConfig.promptsLimit);

      const latestInvoice = subscription.latest_invoice;
      const paymentIntent = typeof latestInvoice === 'object' && latestInvoice !== null ? 
        (latestInvoice as any).payment_intent : null;

      res.json({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent?.client_secret,
      });

    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Stripe webhook handler
  app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;
      
      // Find user by subscription ID and reset their usage
      // This would require a query to find the user
      // For now, we'll implement basic webhook acknowledgment
    }

    res.json({received: true});
  });

  const httpServer = createServer(app);
  return httpServer;
}
