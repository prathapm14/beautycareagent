import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Mic, Paperclip, Bot, User } from "lucide-react";

export default function Chat() {
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your AI Beauty Advisor. How can I help you with your skincare today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: message,
      isUser: true,
      timestamp: new Date()
    };

    const aiResponse = {
      id: messages.length + 2,
      text: "Thanks for your question! I'd recommend focusing on gentle, hydrating products for your skin type. Would you like specific product suggestions?",
      isUser: false,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage, aiResponse]);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="mobile-container py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold ml-4">AI Beauty Advisor</h1>
        </div>
      </div>

      <div className="flex-1 mobile-container pb-24">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-2 max-w-[80%] ${msg.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.isUser ? 'bg-primary' : 'bg-secondary'}`}>
                  {msg.isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <Card className={`${msg.isUser ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                  <CardContent className="p-3">
                    <p className="text-sm">{msg.text}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="mobile-container">
          <div className="flex space-x-2">
            <Button variant="outline" size="icon">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about your skin..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button variant="outline" size="icon">
              <Mic className="w-4 h-4" />
            </Button>
            <Button onClick={sendMessage} disabled={!message.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}