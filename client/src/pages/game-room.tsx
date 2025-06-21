import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HelpModal } from "@/components/help-modal";
import { useWebSocket } from "@/hooks/use-websocket";
import { Home, Users, Share, Send, SkipForward, LogOut, HelpCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GameState {
  room: {
    id: number;
    code: string;
    currentWord: string | null;
    wordChain: string[];
    currentPlayerIndex: number;
  };
  players: Array<{
    id: number;
    name: string;
    isReady: boolean;
    isHost: boolean;
  }>;
  currentPlayer?: {
    id: number;
    name: string;
    isHost: boolean;
  };
}

export default function GameRoom() {
  const [, params] = useRoute("/game/:roomCode");
  const roomCode = params?.roomCode || "";
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentWord, setCurrentWord] = useState("");
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { sendMessage, lastMessage, isConnected } = useWebSocket();
  const { toast } = useToast();

  // Handle WebSocket responses
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'room_joined':
        setGameState({
          room: lastMessage.room,
          players: lastMessage.players,
          currentPlayer: lastMessage.player,
        });
        break;
      
      case 'game_state_updated':
        setGameState(prev => prev ? {
          ...prev,
          room: lastMessage.room,
          players: lastMessage.players,
        } : null);
        break;
      
      case 'error':
        setIsSubmitting(false);
        toast({
          title: "Error",
          description: lastMessage.message,
          variant: "destructive",
        });
        break;
    }
  }, [lastMessage, toast]);

  const handleSubmitWord = () => {
    if (!gameState || !currentWord.trim()) {
      toast({
        title: "Word Required",
        description: "Please enter a word to continue the chain",
        variant: "destructive",
      });
      return;
    }

    const word = currentWord.trim().toUpperCase();
    if (word.length < 2 || !/^[A-Z]+$/.test(word)) {
      toast({
        title: "Invalid Word",
        description: "Please enter a valid word (letters only, at least 2 characters)",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    sendMessage({
      type: 'submit_word',
      word: word,
      roomId: gameState.room.id,
      playerId: gameState.currentPlayer!.id,
    });
    setCurrentWord("");
  };

  const handleSkipTurn = () => {
    if (!gameState) return;

    sendMessage({
      type: 'skip_turn',
      roomId: gameState.room.id,
      playerId: gameState.currentPlayer!.id,
    });
  };

  const handleLeaveRoom = () => {
    if (!gameState) return;

    sendMessage({
      type: 'leave_room',
      roomId: gameState.room.id,
      playerId: gameState.currentPlayer!.id,
    });
    
    // Navigate back to home
    window.location.href = "/";
  };

  const handleShare = async () => {
    const shareText = `Join my Word Chain game! Room code: ${roomCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Word Chain Game',
          text: shareText,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard if share fails
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied!",
          description: "Room code copied to clipboard",
        });
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied!",
        description: "Room code copied to clipboard",
      });
    }
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg">
                {isConnected ? "Joining game room..." : "Connecting..."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPlayerInTurn = gameState.players[gameState.room.currentPlayerIndex];
  const isMyTurn = currentPlayerInTurn?.id === gameState.currentPlayer?.id;
  const lastWord = gameState.room.wordChain[gameState.room.wordChain.length - 1];

  return (
    <div className="min-h-screen bg-surface">
      {/* Room Header */}
      <div className="bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <Home className="text-3xl" />
              <div>
                <h2 className="text-2xl font-bold">Game Room: {gameState.room.code}</h2>
                <p className="text-blue-100">Room Code: {gameState.room.code}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-sm text-blue-100">Players</p>
                <p className="text-2xl font-bold">{gameState.players.length}</p>
              </div>
              <Button
                onClick={handleShare}
                className="bg-white/20 hover:bg-white/30 px-4 py-2"
              >
                <Share className="mr-2" />
                Share
              </Button>
              <Button
                onClick={() => setShowHelpModal(true)}
                className="bg-white/20 hover:bg-white/30 px-4 py-2"
              >
                <HelpCircle className="mr-2" />
                Help
              </Button>
              <Button
                onClick={handleLeaveRoom}
                className="bg-red-500/80 hover:bg-red-500 px-4 py-2"
              >
                <LogOut className="mr-2" />
                Leave
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="rounded-xl shadow-lg overflow-hidden">
          <CardContent className="p-6">
            {/* Current Players */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Users className="mr-2 text-secondary" />
                Players in Game
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {gameState.players.map((player, index) => {
                  const isCurrentTurn = index === gameState.room.currentPlayerIndex;
                  const isMe = player.id === gameState.currentPlayer?.id;
                  
                  return (
                    <div
                      key={player.id}
                      className={`rounded-lg p-4 flex items-center space-x-3 ${
                        isCurrentTurn
                          ? 'bg-primary/10 border-2 border-primary'
                          : isMe
                          ? 'bg-secondary/10'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCurrentTurn
                          ? 'bg-primary'
                          : isMe
                          ? 'bg-secondary'
                          : 'bg-gray-400'
                      }`}>
                        <Users className="text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">
                          {player.name}
                          {isMe && " (You)"}
                          {player.isHost && " 👑"}
                        </p>
                        <p className={`text-sm ${
                          isCurrentTurn
                            ? 'text-primary font-medium'
                            : 'text-text-secondary'
                        }`}>
                          {isCurrentTurn ? "Your turn!" : "Waiting..."}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Word Chain Display */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <ArrowRight className="mr-2 text-primary" />
                Word Chain
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                {gameState.room.wordChain.length === 0 ? (
                  <div className="text-center">
                    <div className="bg-white dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 px-6 py-3 rounded-lg shadow-sm inline-block">
                      <span className="text-xl font-medium text-text-secondary">Waiting for first word...</span>
                    </div>
                    <p className="text-center text-text-secondary mt-4 text-lg">
                      {currentPlayerInTurn?.name} will start the chain!
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-3 justify-center">
                      {gameState.room.wordChain.map((word, index) => (
                        <div key={index} className="flex items-center">
                          <div className="bg-white dark:bg-gray-700 border-2 border-primary px-6 py-3 rounded-lg shadow-sm">
                            <span className="text-xl font-semibold text-primary">{word}</span>
                          </div>
                          {index < gameState.room.wordChain.length - 1 && (
                            <ArrowRight className="text-text-secondary mx-2" />
                          )}
                        </div>
                      ))}
                      <ArrowRight className="text-text-secondary mx-2" />
                      <div className="bg-white dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 px-6 py-3 rounded-lg shadow-sm">
                        <span className="text-xl font-medium text-text-secondary">
                          {isMyTurn ? "Your word..." : `${currentPlayerInTurn?.name}'s turn...`}
                        </span>
                      </div>
                    </div>
                    <p className="text-center text-text-secondary mt-4 text-lg">
                      Connect "{lastWord}" with a related word
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Input Area */}
            {isMyTurn && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <div className="max-w-md mx-auto">
                  <Label className="block text-lg font-semibold mb-3">Your Word:</Label>
                  <div className="flex space-x-3">
                    <Input
                      type="text"
                      placeholder="Enter your word..."
                      value={currentWord}
                      onChange={(e) => setCurrentWord(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !isSubmitting && handleSubmitWord()}
                      className="flex-1 px-4 py-4 text-xl"
                      maxLength={20}
                    />
                    <Button
                      onClick={handleSubmitWord}
                      disabled={isSubmitting || !currentWord.trim()}
                      className="bg-primary hover:bg-primary-dark text-white px-8 py-4 text-lg font-medium"
                    >
                      <Send className="mr-2" />
                      <span className="hidden sm:inline">
                        {isSubmitting ? "Submitting..." : "Submit"}
                      </span>
                    </Button>
                  </div>
                  <p className="text-sm text-text-secondary mt-2">
                    {lastWord
                      ? `Tip: Think of words that relate to "${lastWord}" like similar things, related concepts, or associations`
                      : "Tip: Start the chain with any word you like!"
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Game Controls */}
            <div className="flex justify-center space-x-4 mt-6">
              {isMyTurn && (
                <Button
                  onClick={handleSkipTurn}
                  variant="outline"
                  className="px-6 py-3 text-lg font-medium"
                >
                  <SkipForward className="mr-2" />
                  Skip Turn
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Help Modal */}
      <HelpModal open={showHelpModal} onOpenChange={setShowHelpModal} />
    </div>
  );
}
