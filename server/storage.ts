import { 
  users, skinAnalyses, routines, chatMessages, diaryEntries, reminders,
  type User, type SkinAnalysis, type Routine, type ChatMessage, type DiaryEntry, type Reminder,
  type InsertUser, type InsertSkinAnalysis, type InsertRoutine, type InsertChatMessage, 
  type InsertDiaryEntry, type InsertReminder
} from "@shared/schema";

export interface IStorage {
  // User methods
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  
  // Skin analysis methods
  createSkinAnalysis(analysis: InsertSkinAnalysis): Promise<SkinAnalysis>;
  getSkinAnalysis(id: number): Promise<SkinAnalysis | undefined>;
  getUserLatestAnalysis(userId: number): Promise<SkinAnalysis | undefined>;
  
  // Routine methods
  createRoutine(routine: InsertRoutine): Promise<Routine>;
  getRoutinesByUserId(userId: number): Promise<Routine[]>;
  updateRoutine(id: number, updates: Partial<Routine>): Promise<Routine | undefined>;
  
  // Chat methods
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatHistory(userId: number, limit?: number): Promise<ChatMessage[]>;
  
  // Diary methods
  createDiaryEntry(entry: InsertDiaryEntry): Promise<DiaryEntry>;
  getDiaryEntries(userId: number): Promise<DiaryEntry[]>;
  updateDiaryEntry(id: number, updates: Partial<DiaryEntry>): Promise<DiaryEntry | undefined>;
  
  // Reminder methods
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  getUserReminders(userId: number): Promise<Reminder[]>;
  updateReminder(id: number, updates: Partial<Reminder>): Promise<Reminder | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private skinAnalyses: Map<number, SkinAnalysis>;
  private routines: Map<number, Routine>;
  private chatMessages: Map<number, ChatMessage>;
  private diaryEntries: Map<number, DiaryEntry>;
  private reminders: Map<number, Reminder>;
  private currentUserId: number;
  private currentAnalysisId: number;
  private currentRoutineId: number;
  private currentMessageId: number;
  private currentEntryId: number;
  private currentReminderId: number;

  constructor() {
    this.users = new Map();
    this.skinAnalyses = new Map();
    this.routines = new Map();
    this.chatMessages = new Map();
    this.diaryEntries = new Map();
    this.reminders = new Map();
    this.currentUserId = 1;
    this.currentAnalysisId = 1;
    this.currentRoutineId = 1;
    this.currentMessageId = 1;
    this.currentEntryId = 1;
    this.currentReminderId = 1;
  }

  // User methods
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      id,
      email: insertUser.email || null,
      name: insertUser.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  // Skin analysis methods
  async createSkinAnalysis(insertAnalysis: InsertSkinAnalysis): Promise<SkinAnalysis> {
    const id = this.currentAnalysisId++;
    const analysis: SkinAnalysis = {
      id,
      userId: insertAnalysis.userId,
      skinType: insertAnalysis.skinType,
      concerns: insertAnalysis.concerns || [],
      allergies: insertAnalysis.allergies || [],
      imageUrl: insertAnalysis.imageUrl || null,
      aiDiagnosis: insertAnalysis.aiDiagnosis || null,
      createdAt: new Date(),
    };
    this.skinAnalyses.set(id, analysis);
    return analysis;
  }

  async getSkinAnalysis(id: number): Promise<SkinAnalysis | undefined> {
    return this.skinAnalyses.get(id);
  }

  async getUserLatestAnalysis(userId: number): Promise<SkinAnalysis | undefined> {
    const userAnalyses = Array.from(this.skinAnalyses.values())
      .filter(analysis => analysis.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
    return userAnalyses[0];
  }

  // Routine methods
  async createRoutine(insertRoutine: InsertRoutine): Promise<Routine> {
    const id = this.currentRoutineId++;
    const routine: Routine = {
      id,
      userId: insertRoutine.userId,
      analysisId: insertRoutine.analysisId,
      routineType: insertRoutine.routineType,
      products: insertRoutine.products,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.routines.set(id, routine);
    return routine;
  }

  async getRoutinesByUserId(userId: number): Promise<Routine[]> {
    return Array.from(this.routines.values()).filter(routine => routine.userId === userId);
  }

  async updateRoutine(id: number, updates: Partial<Routine>): Promise<Routine | undefined> {
    const routine = this.routines.get(id);
    if (!routine) return undefined;
    
    const updatedRoutine = { ...routine, ...updates, updatedAt: new Date() };
    this.routines.set(id, updatedRoutine);
    return updatedRoutine;
  }

  // Chat methods
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentMessageId++;
    const message: ChatMessage = {
      id,
      userId: insertMessage.userId,
      message: insertMessage.message,
      isUserMessage: insertMessage.isUserMessage,
      imageUrl: insertMessage.imageUrl || null,
      timestamp: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatHistory(userId: number, limit: number = 50): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => a.timestamp!.getTime() - b.timestamp!.getTime())
      .slice(-limit);
  }

  // Diary methods
  async createDiaryEntry(insertEntry: InsertDiaryEntry): Promise<DiaryEntry> {
    const id = this.currentEntryId++;
    const entry: DiaryEntry = {
      id,
      userId: insertEntry.userId,
      photoUrl: insertEntry.photoUrl || null,
      mood: insertEntry.mood || null,
      condition: insertEntry.condition || null,
      notes: insertEntry.notes || null,
      date: new Date(),
    };
    this.diaryEntries.set(id, entry);
    return entry;
  }

  async getDiaryEntries(userId: number): Promise<DiaryEntry[]> {
    return Array.from(this.diaryEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => b.date!.getTime() - a.date!.getTime());
  }

  async updateDiaryEntry(id: number, updates: Partial<DiaryEntry>): Promise<DiaryEntry | undefined> {
    const entry = this.diaryEntries.get(id);
    if (!entry) return undefined;
    
    const updatedEntry = { ...entry, ...updates };
    this.diaryEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  // Reminder methods
  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const id = this.currentReminderId++;
    const reminder: Reminder = {
      id,
      userId: insertReminder.userId,
      title: insertReminder.title,
      frequency: insertReminder.frequency,
      isActive: insertReminder.isActive ?? true,
      createdAt: new Date(),
    };
    this.reminders.set(id, reminder);
    return reminder;
  }

  async getUserReminders(userId: number): Promise<Reminder[]> {
    return Array.from(this.reminders.values()).filter(reminder => reminder.userId === userId);
  }

  async updateReminder(id: number, updates: Partial<Reminder>): Promise<Reminder | undefined> {
    const reminder = this.reminders.get(id);
    if (!reminder) return undefined;
    
    const updatedReminder = { ...reminder, ...updates };
    this.reminders.set(id, updatedReminder);
    return updatedReminder;
  }
}

export const storage = new MemStorage();
