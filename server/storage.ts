import { gameRooms, players, type GameRoom, type Player, type InsertGameRoom, type InsertPlayer } from "@shared/schema";

export interface IStorage {
  // Game Room methods
  createGameRoom(room: InsertGameRoom): Promise<GameRoom>;
  getGameRoom(id: number): Promise<GameRoom | undefined>;
  getGameRoomByCode(code: string): Promise<GameRoom | undefined>;
  updateGameRoom(id: number, updates: Partial<GameRoom>): Promise<GameRoom | undefined>;
  
  // Player methods
  createPlayer(player: InsertPlayer): Promise<Player>;
  getPlayer(id: number): Promise<Player | undefined>;
  getPlayersByRoomId(roomId: number): Promise<Player[]>;
  updatePlayer(id: number, updates: Partial<Player>): Promise<Player | undefined>;
  removePlayer(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private gameRooms: Map<number, GameRoom>;
  private players: Map<number, Player>;
  private currentRoomId: number;
  private currentPlayerId: number;

  constructor() {
    this.gameRooms = new Map();
    this.players = new Map();
    this.currentRoomId = 1;
    this.currentPlayerId = 1;
  }

  async createGameRoom(insertRoom: InsertGameRoom): Promise<GameRoom> {
    const id = this.currentRoomId++;
    const room: GameRoom = {
      id,
      code: insertRoom.code,
      currentWord: insertRoom.currentWord || null,
      wordChain: insertRoom.wordChain || null,
      currentPlayerIndex: insertRoom.currentPlayerIndex || null,
      isActive: insertRoom.isActive || null,
      createdAt: new Date(),
    };
    this.gameRooms.set(id, room);
    return room;
  }

  async getGameRoom(id: number): Promise<GameRoom | undefined> {
    return this.gameRooms.get(id);
  }

  async getGameRoomByCode(code: string): Promise<GameRoom | undefined> {
    return Array.from(this.gameRooms.values()).find(room => room.code === code);
  }

  async updateGameRoom(id: number, updates: Partial<GameRoom>): Promise<GameRoom | undefined> {
    const room = this.gameRooms.get(id);
    if (!room) return undefined;
    
    const updatedRoom = { ...room, ...updates };
    this.gameRooms.set(id, updatedRoom);
    return updatedRoom;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = this.currentPlayerId++;
    const player: Player = {
      id,
      name: insertPlayer.name,
      roomId: insertPlayer.roomId || null,
      isReady: insertPlayer.isReady || null,
      isHost: insertPlayer.isHost || null,
      joinedAt: new Date(),
    };
    this.players.set(id, player);
    return player;
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async getPlayersByRoomId(roomId: number): Promise<Player[]> {
    return Array.from(this.players.values()).filter(player => player.roomId === roomId);
  }

  async updatePlayer(id: number, updates: Partial<Player>): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;
    
    const updatedPlayer = { ...player, ...updates };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async removePlayer(id: number): Promise<void> {
    this.players.delete(id);
  }

  // Helper method to generate unique room codes
  generateRoomCode(): string {
    const words = ['FAMILY', 'GARDEN', 'SUNSET', 'OCEAN', 'FOREST', 'MEADOW', 'BRIDGE', 'CASTLE', 'FLOWER', 'MAPLE'];
    return words[Math.floor(Math.random() * words.length)];
  }
}

export const storage = new MemStorage();
