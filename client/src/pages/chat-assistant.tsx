import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Paperclip, Send, Camera, FileText, Image, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  attachments?: Array<{
    type: 'image' | 'file';
    name: string;
    url: string;
  }>;
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your BeautyCare AI Assistant. I'm here to help you with skincare advice, product recommendations, and beauty tips. How can I assist you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
          toast({
            title: "Voice input error",
            description: "Please try again or check your microphone permissions.",
            variant: "destructive"
          });
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [toast]);

  // Handle sending messages to AI backend
  const sendMessage = async (messageContent: string, attachments?: Array<any>) => {
    if (!messageContent.trim() && !attachments?.length) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      isUser: true,
      timestamp: new Date(),
      attachments
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Simulate AI response - replace with actual API call
      await simulateAIResponse(messageContent, attachments);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Send message to AI backend
  const simulateAIResponse = async (userMessage: string, attachments?: Array<any>) => {
    try {
      const formData = new FormData();
      formData.append('message', userMessage);
      
      if (attachments?.length) {
        attachments.forEach((attachment, index) => {
          formData.append(`attachment_${index}`, attachment.name);
        });
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      // Fallback response if API fails
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm here to help with your beauty and skincare questions. Please ensure you're connected to the internet for the best experience.",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    }
  };

  // Handle voice input
  const startVoiceInput = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const attachments = Array.from(files).map(file => ({
        type: file.type.startsWith('image/') ? 'image' : 'file' as const,
        name: file.name,
        url: URL.createObjectURL(file)
      }));

      sendMessage(`I've shared ${files.length} file(s) with you.`, attachments);
    }
  };

  // Handle camera capture
  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const attachments = Array.from(files).map(file => ({
        type: 'image' as const,
        name: file.name,
        url: URL.createObjectURL(file)
      }));

      sendMessage("I've taken a photo to share with you.", attachments);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                BeautyCare AI Assistant
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Your personal beauty advisor
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto px-4 py-6">
          <div className="h-full overflow-y-auto space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.isUser ? 'bg-primary' : 'gradient-secondary'
                  }`}>
                    {message.isUser ? (
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    ) : (
                      <Sparkles className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  <Card className={`card-shadow border-0 ${
                    message.isUser 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-white dark:bg-gray-800'
                  }`}>
                    <CardContent className="p-4">
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 bg-black/10 rounded-lg">
                              {attachment.type === 'image' ? (
                                <Image className="w-4 h-4" />
                              ) : (
                                <FileText className="w-4 h-4" />
                              )}
                              <span className="text-xs">{attachment.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className={`text-xs mt-2 ${
                        message.isUser ? 'text-primary-foreground/70' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full gradient-secondary flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <Card className="bg-white dark:bg-gray-800 card-shadow border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Thinking...
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input Panel */}
      <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your beauty question..."
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage(inputMessage))}
                />
                
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={startVoiceInput}
                    disabled={isListening || !recognitionRef.current}
                    className={`touch-target ${isListening ? 'text-red-500' : ''}`}
                  >
                    <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
                  </Button>
                  
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="touch-target"
                    >
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.gif"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => cameraInputRef.current?.click()}
                      className="touch-target"
                    >
                      <Camera className="w-5 h-5" />
                    </Button>
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleCameraCapture}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => sendMessage(inputMessage)}
              disabled={isLoading || (!inputMessage.trim())}
              className="btn-primary"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2025 BeautyCare AI. Powered by advanced AI technology.
            </p>
          </div>
        </div>
      </footer>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.gif"
        onChange={handleFileUpload}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />
    </div>
  );
}