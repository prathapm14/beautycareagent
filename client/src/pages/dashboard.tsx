import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Camera, MessageCircle, Calendar, Settings, 
  Sparkles, Clock, ChevronRight, Plus,
  Sun, Moon, Droplets, Shield
} from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      setLocation("/");
      return;
    }
    setUserId(storedUserId);
  }, [setLocation]);

  const { data: userData, isLoading } = useQuery({
    queryKey: ["/api/user", userId],
    enabled: !!userId,
    retry: false,
  });

  const generateRoutinesMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/routines/${userId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId] });
      toast({
        title: "Routines Generated!",
        description: "Your personalized skincare routines are ready.",
      });
    }
  });

  if (!userId || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="mobile-container text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="mobile-container text-center">
          <p>Unable to load user data. Please try again.</p>
          <Button onClick={() => setLocation("/")} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const { user, analysis } = userData;

  const quickActions = [
    {
      icon: Camera,
      title: "Skin Analysis",
      description: "Take a new photo for AI analysis",
      route: "/analysis",
      color: "gradient-primary"
    },
    {
      icon: MessageCircle,
      title: "AI Advisor",
      description: "Ask questions about your skin",
      route: "/chat",
      color: "gradient-secondary"
    },
    {
      icon: Calendar,
      title: "Skin Diary",
      description: "Log your daily skin condition",
      route: "/diary",
      color: "bg-green-500"
    },
    {
      icon: Settings,
      title: "Settings",
      description: "Manage your profile and preferences",
      route: "/settings",
      color: "bg-gray-500"
    }
  ];

  const getSkinTypeIcon = (skinType: string) => {
    switch (skinType) {
      case 'oily': return Droplets;
      case 'dry': return Sun;
      case 'sensitive': return Shield;
      default: return Sparkles;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mobile-container py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome back, {user.name}!
              </h1>
              <p className="text-muted-foreground">
                Here's your skincare overview
              </p>
            </div>
            <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Skin Analysis Summary */}
        {analysis && (
          <Card className="mb-6 card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {(() => {
                  const IconComponent = getSkinTypeIcon(analysis.skinType);
                  return <IconComponent className="w-5 h-5 text-primary" />;
                })()}
                <span>Your Skin Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Skin Type</span>
                <Badge variant="secondary" className="capitalize">
                  {analysis.skinType}
                </Badge>
              </div>
              
              <div>
                <span className="text-sm font-medium mb-2 block">Main Concerns</span>
                <div className="flex flex-wrap gap-2">
                  {analysis.concerns.map((concern) => (
                    <Badge key={concern} variant="outline" className="capitalize">
                      {concern.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {analysis.aiDiagnosis && (
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">AI Analysis</span>
                    <Badge variant="secondary">
                      {(analysis.aiDiagnosis as any).confidence * 100}% confident
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Severity: {(analysis.aiDiagnosis as any).severity}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Routines Section */}
        <Card className="mb-6 card-shadow border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Routines</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateRoutinesMutation.mutate()}
                disabled={generateRoutinesMutation.isPending}
              >
                <Plus className="w-4 h-4 mr-1" />
                Generate
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg cursor-pointer"
                onClick={() => setLocation("/routines")}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Sun className="w-5 h-5 text-orange-500" />
                  <span className="font-medium">Morning</span>
                </div>
                <p className="text-sm text-muted-foreground">4 steps</p>
              </div>
              
              <div 
                className="bg-indigo-50 dark:bg-indigo-950 p-4 rounded-lg cursor-pointer"
                onClick={() => setLocation("/routines")}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Moon className="w-5 h-5 text-indigo-500" />
                  <span className="font-medium">Evening</span>
                </div>
                <p className="text-sm text-muted-foreground">3 steps</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Tracking */}
        <Card className="mb-6 card-shadow border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>This Week's Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Routine Completion</span>
                  <span>4/7 days</span>
                </div>
                <Progress value={57} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Skin Diary Entries</span>
                  <span>3/7 days</span>
                </div>
                <Progress value={43} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className="card-shadow border-0 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setLocation(action.route)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}