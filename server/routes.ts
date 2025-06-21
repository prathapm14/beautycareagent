import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { onboardingSchema, type OnboardingData, type AIDiagnosis } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes for skincare app
  
  // User onboarding and skin analysis
  app.post('/api/onboard', async (req, res) => {
    try {
      const data = onboardingSchema.parse(req.body);
      
      // Create user
      const user = await storage.createUser({
        name: data.name,
        email: data.email,
      });

      // Create skin analysis
      const analysis = await storage.createSkinAnalysis({
        userId: user.id,
        skinType: data.skinType,
        concerns: data.concerns,
        allergies: data.allergies,
      });

      // Generate AI diagnosis (mock for now)
      const aiDiagnosis: AIDiagnosis = {
        severity: data.concerns.includes('acne') ? 'moderate' : 'mild',
        primaryConcerns: data.concerns,
        recommendations: [
          'Use gentle cleanser twice daily',
          'Apply moisturizer after cleansing',
          'Use sunscreen during the day'
        ],
        confidence: 0.85
      };

      // Update analysis with AI diagnosis
      await storage.createSkinAnalysis({
        userId: user.id,
        skinType: data.skinType,
        concerns: data.concerns,
        allergies: data.allergies,
        aiDiagnosis
      });

      res.json({ user, analysis: { ...analysis, aiDiagnosis } });
    } catch (error) {
      console.error('Onboarding error:', error);
      res.status(400).json({ error: 'Invalid onboarding data' });
    }
  });

  // Get user profile and latest analysis
  app.get('/api/user/:id', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      const analysis = await storage.getUserLatestAnalysis(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user, analysis });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user data' });
    }
  });

  // Generate personalized routines
  app.post('/api/routines/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const analysis = await storage.getUserLatestAnalysis(userId);
      
      if (!analysis) {
        return res.status(404).json({ error: 'No skin analysis found' });
      }

      // Generate morning routine
      const morningProducts = [
        { name: 'Gentle Cleanser', purpose: 'Remove overnight impurities', order: 1 },
        { name: 'Vitamin C Serum', purpose: 'Antioxidant protection', order: 2 },
        { name: 'Moisturizer', purpose: 'Hydrate and protect skin', order: 3 },
        { name: 'Sunscreen SPF 30+', purpose: 'UV protection', order: 4 }
      ];

      // Generate evening routine
      const eveningProducts = [
        { name: 'Gentle Cleanser', purpose: 'Remove daily impurities', order: 1 },
        { name: 'Treatment Serum', purpose: 'Target specific concerns', order: 2 },
        { name: 'Night Moisturizer', purpose: 'Deep overnight hydration', order: 3 }
      ];

      const morningRoutine = await storage.createRoutine({
        userId,
        analysisId: analysis.id,
        routineType: 'morning',
        products: morningProducts
      });

      const eveningRoutine = await storage.createRoutine({
        userId,
        analysisId: analysis.id,
        routineType: 'evening',
        products: eveningProducts
      });

      res.json({ morning: morningRoutine, evening: eveningRoutine });
    } catch (error) {
      console.error('Generate routines error:', error);
      res.status(500).json({ error: 'Failed to generate routines' });
    }
  });

  // Chat with AI advisor
  app.post('/api/chat/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { message, imageUrl } = req.body;

      // Save user message
      await storage.createChatMessage({
        userId,
        message,
        isUserMessage: true,
        imageUrl
      });

      // Generate AI response (mock for now)
      const aiResponse = generateAIResponse(message);
      
      // Save AI response
      const aiMessage = await storage.createChatMessage({
        userId,
        message: aiResponse,
        isUserMessage: false
      });

      res.json({ response: aiMessage });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Failed to process chat message' });
    }
  });

  // AI Chat endpoint for BeautyCare Assistant
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Message is required" });
      }

      // Generate AI response based on message content
      const response = generateBeautyAIResponse(message);
      
      res.json({ response });
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // Get chat history
  app.get('/api/chat/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const messages = await storage.getChatHistory(userId);
      res.json({ messages });
    } catch (error) {
      console.error('Get chat history error:', error);
      res.status(500).json({ error: 'Failed to get chat history' });
    }
  });

  // Skin diary entries
  app.post('/api/diary/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { photoUrl, mood, condition, notes } = req.body;

      const entry = await storage.createDiaryEntry({
        userId,
        photoUrl,
        mood,
        condition,
        notes
      });

      res.json({ entry });
    } catch (error) {
      console.error('Create diary entry error:', error);
      res.status(500).json({ error: 'Failed to create diary entry' });
    }
  });

  // Get diary entries
  app.get('/api/diary/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const entries = await storage.getDiaryEntries(userId);
      res.json({ entries });
    } catch (error) {
      console.error('Get diary entries error:', error);
      res.status(500).json({ error: 'Failed to get diary entries' });
    }
  });

  // Reminders
  app.post('/api/reminders/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { title, frequency } = req.body;

      const reminder = await storage.createReminder({
        userId,
        title,
        frequency,
        isActive: true
      });

      res.json({ reminder });
    } catch (error) {
      console.error('Create reminder error:', error);
      res.status(500).json({ error: 'Failed to create reminder' });
    }
  });

  // Get user reminders
  app.get('/api/reminders/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const reminders = await storage.getUserReminders(userId);
      res.json({ reminders });
    } catch (error) {
      console.error('Get reminders error:', error);
      res.status(500).json({ error: 'Failed to get reminders' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function generateBeautyAIResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Skincare advice
  if (lowerMessage.includes('acne') || lowerMessage.includes('pimple') || lowerMessage.includes('breakout')) {
    return "For acne-prone skin, I recommend using a gentle salicylic acid cleanser, followed by a lightweight, non-comedogenic moisturizer. Consider adding a retinol treatment at night, but start slowly. Always use sunscreen during the day as some acne treatments can increase sun sensitivity.";
  }
  
  if (lowerMessage.includes('dry') || lowerMessage.includes('dehydrated')) {
    return "Dry skin needs extra hydration! Use a gentle, cream-based cleanser and follow with a rich moisturizer containing hyaluronic acid or ceramides. Consider adding a hydrating serum and use a humidifier at night. Avoid over-cleansing and hot water, which can strip natural oils.";
  }
  
  if (lowerMessage.includes('oily') || lowerMessage.includes('greasy')) {
    return "Oily skin benefits from a foaming cleanser with salicylic acid to control excess oil. Use a lightweight, oil-free moisturizer - even oily skin needs hydration! Consider clay masks 1-2 times per week and always use a broad-spectrum sunscreen that's formulated for oily skin.";
  }
  
  if (lowerMessage.includes('sensitive') || lowerMessage.includes('irritated')) {
    return "Sensitive skin requires gentle, fragrance-free products. Look for cleansers with minimal ingredients, and moisturizers with soothing ingredients like aloe vera or chamomile. Always patch test new products and introduce them one at a time. Avoid alcohol-based products and strong actives.";
  }
  
  if (lowerMessage.includes('aging') || lowerMessage.includes('wrinkle') || lowerMessage.includes('anti-aging')) {
    return "For anti-aging care, focus on prevention and treatment. Use a vitamin C serum in the morning for antioxidant protection, and consider retinol at night to boost cell turnover. Hyaluronic acid helps plump fine lines, and peptides can support collagen production. Never skip sunscreen - it's the most important anti-aging step!";
  }
  
  if (lowerMessage.includes('routine') || lowerMessage.includes('order') || lowerMessage.includes('steps')) {
    return "A basic skincare routine should follow this order: Morning - cleanser, vitamin C serum, moisturizer, sunscreen. Evening - cleanser, treatment serums (like retinol), moisturizer. Start with the basics and add products gradually. Always introduce new products one at a time to monitor your skin's reaction.";
  }
  
  if (lowerMessage.includes('sunscreen') || lowerMessage.includes('spf')) {
    return "Sunscreen is crucial for all skin types! Use broad-spectrum SPF 30 or higher daily, even indoors. Reapply every 2 hours when outdoors. For daily wear, chemical sunscreens blend well under makeup, while mineral sunscreens are gentler for sensitive skin. Don't forget your neck and hands!";
  }
  
  if (lowerMessage.includes('product') || lowerMessage.includes('recommend')) {
    return "I'd love to recommend products tailored to your needs! Could you tell me more about your skin type (oily, dry, combination, sensitive) and any specific concerns you're addressing? This will help me suggest the most suitable products for your routine.";
  }
  
  // General beauty advice
  if (lowerMessage.includes('makeup') || lowerMessage.includes('cosmetic')) {
    return "For healthy makeup application, always start with clean, moisturized skin. Use a primer to create a smooth base and help makeup last longer. Remove all makeup thoroughly before bed to prevent clogged pores. Consider makeup-free days to let your skin breathe!";
  }
  
  // Default response
  return "Thank you for your question! I'm here to help with all your beauty and skincare needs. Whether you're looking for product recommendations, routine advice, or solutions to specific skin concerns, I'm ready to assist. What specific aspect of your skincare routine would you like to discuss?";
}

// Helper function to generate AI responses
function generateAIResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  if (message.includes('acne') || message.includes('breakout')) {
    return "For acne management, try applying ice to reduce inflammation. Use gentle, non-comedogenic products and avoid over-washing. Consider salicylic acid or benzoyl peroxide treatments.";
  }
  
  if (message.includes('dry') || message.includes('hydrat')) {
    return "For dry skin, focus on hydration with hyaluronic acid serums and rich moisturizers. Use lukewarm water when cleansing and apply moisturizer while skin is still damp.";
  }
  
  if (message.includes('sensitive') || message.includes('irritat')) {
    return "For sensitive skin, stick to fragrance-free, gentle products. Introduce new products gradually and always patch test first. Look for ingredients like ceramides and niacinamide.";
  }
  
  if (message.includes('sun') || message.includes('spf')) {
    return "Always use broad-spectrum SPF 30 or higher daily, even indoors. Reapply every 2 hours when outdoors. This is the most important anti-aging step you can take.";
  }
  
  return "I'm here to help with your skincare concerns! Feel free to ask about specific ingredients, routines, or skin issues you're experiencing.";
}
