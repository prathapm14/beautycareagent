import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { wsMessageSchema, type WSMessage, type WSResponse } from "@shared/schema";

interface ExtendedWebSocket extends WebSocket {
  playerId?: number;
  roomId?: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time multiplayer functionality
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients: Map<number, ExtendedWebSocket> = new Map();

  function broadcast(roomId: number, message: WSResponse) {
    const roomClients = Array.from(clients.values()).filter(client => 
      client.roomId === roomId && client.readyState === WebSocket.OPEN
    );
    
    roomClients.forEach(client => {
      client.send(JSON.stringify(message));
    });
  }

  function sendToClient(playerId: number, message: WSResponse) {
    const client = clients.get(playerId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  wss.on('connection', (ws: ExtendedWebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data) => {
      try {
        const rawMessage = JSON.parse(data.toString());
        const message = wsMessageSchema.parse(rawMessage);

        switch (message.type) {
          case 'create_room': {
            try {
              // Generate unique room code
              let roomCode: string;
              let existingRoom;
              do {
                roomCode = (storage as any).generateRoomCode();
                existingRoom = await storage.getGameRoomByCode(roomCode);
              } while (existingRoom);

              // Create room
              const room = await storage.createGameRoom({
                code: roomCode,
                currentWord: null,
                wordChain: [],
                currentPlayerIndex: 0,
                isActive: true,
              });

              // Create host player
              const player = await storage.createPlayer({
                name: message.playerName,
                roomId: room.id,
                isReady: true,
                isHost: true,
              });

              ws.playerId = player.id;
              ws.roomId = room.id;
              clients.set(player.id, ws);

              const response: WSResponse = {
                type: 'room_created',
                room: {
                  id: room.id,
                  code: room.code,
                },
                player: {
                  id: player.id,
                  name: player.name,
                  isHost: player.isHost || false,
                },
              };

              sendToClient(player.id, response);
            } catch (error) {
              sendToClient(-1, { type: 'error', message: 'Failed to create room' });
            }
            break;
          }

          case 'join_room': {
            try {
              const room = await storage.getGameRoomByCode(message.roomCode);
              if (!room) {
                ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
                break;
              }

              // Check if room is full (max 6 players)
              const existingPlayers = await storage.getPlayersByRoomId(room.id);
              if (existingPlayers.length >= 6) {
                ws.send(JSON.stringify({ type: 'error', message: 'Room is full' }));
                break;
              }

              // Create player
              const player = await storage.createPlayer({
                name: message.playerName,
                roomId: room.id,
                isReady: true,
                isHost: false,
              });

              ws.playerId = player.id;
              ws.roomId = room.id;
              clients.set(player.id, ws);

              // Get all players in room
              const allPlayers = await storage.getPlayersByRoomId(room.id);

              const response: WSResponse = {
                type: 'room_joined',
                room: {
                  id: room.id,
                  code: room.code,
                  currentWord: room.currentWord,
                  wordChain: room.wordChain || [],
                  currentPlayerIndex: room.currentPlayerIndex || 0,
                },
                player: {
                  id: player.id,
                  name: player.name,
                  isHost: player.isHost || false,
                },
                players: allPlayers.map(p => ({
                  id: p.id,
                  name: p.name,
                  isReady: p.isReady || false,
                  isHost: p.isHost || false,
                })),
              };

              sendToClient(player.id, response);

              // Broadcast updated player list to all players in room
              const updateMessage: WSResponse = {
                type: 'game_state_updated',
                room: {
                  id: room.id,
                  code: room.code,
                  currentWord: room.currentWord,
                  wordChain: room.wordChain || [],
                  currentPlayerIndex: room.currentPlayerIndex || 0,
                },
                players: allPlayers.map(p => ({
                  id: p.id,
                  name: p.name,
                  isReady: p.isReady || false,
                  isHost: p.isHost || false,
                })),
              };

              broadcast(room.id, updateMessage);
            } catch (error) {
              ws.send(JSON.stringify({ type: 'error', message: 'Failed to join room' }));
            }
            break;
          }

          case 'submit_word': {
            try {
              const room = await storage.getGameRoom(message.roomId);
              const player = await storage.getPlayer(message.playerId);
              
              if (!room || !player) {
                sendToClient(message.playerId, { type: 'error', message: 'Room or player not found' });
                break;
              }

              const players = await storage.getPlayersByRoomId(room.id);
              const currentPlayer = players[room.currentPlayerIndex ?? 0];

              // Check if it's the player's turn
              if (currentPlayer.id !== message.playerId) {
                sendToClient(message.playerId, { type: 'error', message: 'Not your turn' });
                break;
              }

              // Simple word validation
              const word = message.word.trim().toUpperCase();
              if (word.length < 2 || !/^[A-Z]+$/.test(word)) {
                sendToClient(message.playerId, { type: 'error', message: 'Please enter a valid word (letters only, at least 2 characters)' });
                break;
              }

              // Update game state
              const newWordChain = [...(room.wordChain || []), word];
              const nextPlayerIndex = ((room.currentPlayerIndex ?? 0) + 1) % players.length;

              await storage.updateGameRoom(room.id, {
                currentWord: word,
                wordChain: newWordChain,
                currentPlayerIndex: nextPlayerIndex,
              });

              // Broadcast updated game state
              const updateMessage: WSResponse = {
                type: 'game_state_updated',
                room: {
                  id: room.id,
                  code: room.code,
                  currentWord: word,
                  wordChain: newWordChain,
                  currentPlayerIndex: nextPlayerIndex,
                },
                players: players.map(p => ({
                  id: p.id,
                  name: p.name,
                  isReady: p.isReady || false,
                  isHost: p.isHost || false,
                })),
              };

              broadcast(room.id, updateMessage);
            } catch (error) {
              sendToClient(message.playerId, { type: 'error', message: 'Failed to submit word' });
            }
            break;
          }

          case 'skip_turn': {
            try {
              const room = await storage.getGameRoom(message.roomId);
              if (!room) {
                sendToClient(message.playerId, { type: 'error', message: 'Room not found' });
                break;
              }

              const players = await storage.getPlayersByRoomId(room.id);
              const currentPlayer = players[room.currentPlayerIndex ?? 0];

              // Check if it's the player's turn
              if (currentPlayer.id !== message.playerId) {
                sendToClient(message.playerId, { type: 'error', message: 'Not your turn' });
                break;
              }

              // Move to next player
              const nextPlayerIndex = ((room.currentPlayerIndex ?? 0) + 1) % players.length;
              await storage.updateGameRoom(room.id, {
                currentPlayerIndex: nextPlayerIndex,
              });

              // Broadcast updated game state
              const updateMessage: WSResponse = {
                type: 'game_state_updated',
                room: {
                  id: room.id,
                  code: room.code,
                  currentWord: room.currentWord,
                  wordChain: room.wordChain || [],
                  currentPlayerIndex: nextPlayerIndex,
                },
                players: players.map(p => ({
                  id: p.id,
                  name: p.name,
                  isReady: p.isReady || false,
                  isHost: p.isHost || false,
                })),
              };

              broadcast(room.id, updateMessage);
            } catch (error) {
              sendToClient(message.playerId, { type: 'error', message: 'Failed to skip turn' });
            }
            break;
          }

          case 'leave_room': {
            try {
              await storage.removePlayer(message.playerId);
              clients.delete(message.playerId);

              // Get remaining players and broadcast update
              const remainingPlayers = await storage.getPlayersByRoomId(message.roomId);
              const room = await storage.getGameRoom(message.roomId);

              if (room && remainingPlayers.length > 0) {
                // If current player left, advance to next player
                let newCurrentPlayerIndex = room.currentPlayerIndex ?? 0;
                if (newCurrentPlayerIndex >= remainingPlayers.length) {
                  newCurrentPlayerIndex = 0;
                }

                await storage.updateGameRoom(room.id, {
                  currentPlayerIndex: newCurrentPlayerIndex,
                });

                const updateMessage: WSResponse = {
                  type: 'game_state_updated',
                  room: {
                    id: room.id,
                    code: room.code,
                    currentWord: room.currentWord,
                    wordChain: room.wordChain || [],
                    currentPlayerIndex: newCurrentPlayerIndex,
                  },
                  players: remainingPlayers.map(p => ({
                    id: p.id,
                    name: p.name,
                    isReady: p.isReady ?? false,
                    isHost: p.isHost ?? false,
                  })),
                };

                broadcast(room.id, updateMessage);
              }
            } catch (error) {
              console.error('Error handling leave room:', error);
            }
            break;
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      if (ws.playerId) {
        clients.delete(ws.playerId);
        console.log(`Player ${ws.playerId} disconnected`);
      }
    });
  });

  return httpServer;
}
