import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const gameRooms = pgTable("game_rooms", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  currentWord: text("current_word"),
  wordChain: text("word_chain").array().default([]),
  currentPlayerIndex: integer("current_player_index").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  roomId: integer("room_id").references(() => gameRooms.id),
  isReady: boolean("is_ready").default(false),
  isHost: boolean("is_host").default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const insertGameRoomSchema = createInsertSchema(gameRooms).pick({
  code: true,
  currentWord: true,
  wordChain: true,
  currentPlayerIndex: true,
  isActive: true,
});

export const insertPlayerSchema = createInsertSchema(players).pick({
  name: true,
  roomId: true,
  isReady: true,
  isHost: true,
});

export type InsertGameRoom = z.infer<typeof insertGameRoomSchema>;
export type GameRoom = typeof gameRooms.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

// WebSocket message types
export const wsMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("join_room"),
    roomCode: z.string(),
    playerName: z.string(),
  }),
  z.object({
    type: z.literal("create_room"),
    playerName: z.string(),
  }),
  z.object({
    type: z.literal("submit_word"),
    word: z.string(),
    roomId: z.number(),
    playerId: z.number(),
  }),
  z.object({
    type: z.literal("skip_turn"),
    roomId: z.number(),
    playerId: z.number(),
  }),
  z.object({
    type: z.literal("leave_room"),
    roomId: z.number(),
    playerId: z.number(),
  }),
]);

export type WSMessage = z.infer<typeof wsMessageSchema>;

export const wsResponseSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("room_created"),
    room: z.object({
      id: z.number(),
      code: z.string(),
    }),
    player: z.object({
      id: z.number(),
      name: z.string(),
      isHost: z.boolean(),
    }),
  }),
  z.object({
    type: z.literal("room_joined"),
    room: z.object({
      id: z.number(),
      code: z.string(),
      currentWord: z.string().nullable(),
      wordChain: z.array(z.string()),
      currentPlayerIndex: z.number(),
    }),
    player: z.object({
      id: z.number(),
      name: z.string(),
      isHost: z.boolean(),
    }),
    players: z.array(z.object({
      id: z.number(),
      name: z.string(),
      isReady: z.boolean(),
      isHost: z.boolean(),
    })),
  }),
  z.object({
    type: z.literal("game_state_updated"),
    room: z.object({
      id: z.number(),
      code: z.string(),
      currentWord: z.string().nullable(),
      wordChain: z.array(z.string()),
      currentPlayerIndex: z.number(),
    }),
    players: z.array(z.object({
      id: z.number(),
      name: z.string(),
      isReady: z.boolean(),
      isHost: z.boolean(),
    })),
  }),
  z.object({
    type: z.literal("error"),
    message: z.string(),
  }),
]);

export type WSResponse = z.infer<typeof wsResponseSchema>;
