import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HelpModal } from "@/components/help-modal";
import { useWebSocket } from "@/hooks/use-websocket";
import { PlusCircle, Users, Link as LinkIcon, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const { sendMessage, lastMessage, isConnected } = useWebSocket();
  const { toast } = useToast();

  // Handle WebSocket responses
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'room_created':
        setIsCreating(false);
        toast({
          title: "Room Created!",
          description: `Room code: ${lastMessage.room.code}`,
        });
        // Navigate to game room
        window.location.href = `/game/${lastMessage.room.code}`;
        break;
      
      case 'room_joined':
        setIsJoining(false);
        toast({
          title: "Joined Room!",
          description: `Welcome to room ${lastMessage.room.code}`,
        });
        // Navigate to game room
        window.location.href = `/game/${lastMessage.room.code}`;
        break;
      
      case 'error':
        setIsCreating(false);
        setIsJoining(false);
        toast({
          title: "Error",
          description: lastMessage.message,
          variant: "destructive",
        });
        break;
    }
  }, [lastMessage, toast]);

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to create a room",
        variant: "destructive",
      });
      return;
    }

    if (!isConnected) {
      toast({
        title: "Connection Error",
        description: "Please wait for connection to establish",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    sendMessage({
      type: 'create_room',
      playerName: playerName.trim(),
    });
    setShowCreateDialog(false);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) {
      toast({
        title: "Information Required",
        description: "Please enter both your name and room code",
        variant: "destructive",
      });
      return;
    }

    if (!isConnected) {
      toast({
        title: "Connection Error",
        description: "Please wait for connection to establish",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    sendMessage({
      type: 'join_room',
      roomCode: roomCode.trim().toUpperCase(),
      playerName: playerName.trim(),
    });
    setShowJoinDialog(false);
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <LinkIcon className="text-primary text-4xl" />
              <h1 className="text-3xl font-bold text-primary">Word Chain</h1>
            </div>
            <Button
              onClick={() => setShowHelpModal(true)}
              className="bg-secondary hover:bg-secondary-dark text-white px-6 py-3 text-xl font-medium"
            >
              <HelpCircle className="mr-2" />
              How to Play
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <Card className="rounded-xl shadow-lg p-8 mb-8">
          <CardContent className="pt-0">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Welcome to Word Chain!</h2>
              <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                A fun word game where players connect words together. Perfect for playing with family and friends!
              </p>
              
              {/* Connection Status */}
              <div className="mb-6">
                {isConnected ? (
                  <div className="text-secondary font-medium">✓ Connected and ready to play</div>
                ) : (
                  <div className="text-orange-600 font-medium">⏳ Connecting...</div>
                )}
              </div>
              
              {/* Game Room Options */}
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {/* Create Room */}
                <div className="bg-primary-light rounded-lg p-6 border-2 border-primary-light">
                  <PlusCircle className="text-primary text-5xl mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold mb-3">Create New Game</h3>
                  <p className="text-text-secondary mb-4">Start a new game room and invite others to join</p>
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    disabled={!isConnected || isCreating}
                    className="bg-primary hover:bg-primary-dark text-white px-8 py-4 text-lg font-medium w-full"
                  >
                    {isCreating ? "Creating..." : "Create Room"}
                  </Button>
                </div>
                
                {/* Join Room */}
                <div className="bg-secondary-light rounded-lg p-6 border-2 border-secondary-light">
                  <Users className="text-secondary text-5xl mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold mb-3">Join Existing Game</h3>
                  <p className="text-text-secondary mb-4">Enter a room code to join your friends</p>
                  <Button
                    onClick={() => setShowJoinDialog(true)}
                    disabled={!isConnected || isJoining}
                    className="bg-secondary hover:bg-secondary-dark text-white px-8 py-4 text-lg font-medium w-full"
                  >
                    {isJoining ? "Joining..." : "Join Room"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Create Room Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create New Game Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="createName" className="text-lg">Your Name</Label>
              <Input
                id="createName"
                type="text"
                placeholder="Enter your name..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="text-lg py-3"
                maxLength={20}
              />
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowCreateDialog(false)}
                variant="outline"
                className="flex-1 py-3 text-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="flex-1 py-3 text-lg bg-primary hover:bg-primary-dark"
              >
                {isCreating ? "Creating..." : "Create Room"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Room Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Join Game Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="joinName" className="text-lg">Your Name</Label>
              <Input
                id="joinName"
                type="text"
                placeholder="Enter your name..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="text-lg py-3"
                maxLength={20}
              />
            </div>
            <div>
              <Label htmlFor="roomCode" className="text-lg">Room Code</Label>
              <Input
                id="roomCode"
                type="text"
                placeholder="Enter room code..."
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="text-lg py-3"
                maxLength={10}
              />
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowJoinDialog(false)}
                variant="outline"
                className="flex-1 py-3 text-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleJoinRoom}
                disabled={isJoining}
                className="flex-1 py-3 text-lg bg-secondary hover:bg-secondary-dark"
              >
                {isJoining ? "Joining..." : "Join Room"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Modal */}
      <HelpModal open={showHelpModal} onOpenChange={setShowHelpModal} />
    </div>
  );
}
