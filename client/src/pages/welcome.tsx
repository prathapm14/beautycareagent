import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Camera, MessageCircle, Calendar, ChevronRight } from "lucide-react";

export default function Welcome() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: Camera,
      title: "AI Skin Analysis",
      description: "Upload photos for instant AI-powered skin assessment"
    },
    {
      icon: MessageCircle,
      title: "Personal Beauty Advisor",
      description: "Chat with AI for personalized skincare guidance"
    },
    {
      icon: Sparkles,
      title: "Custom Routines",
      description: "Get tailored morning and evening skincare routines"
    },
    {
      icon: Calendar,
      title: "Skin Diary",
      description: "Track your progress with daily photos and logs"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="mobile-container py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 gradient-primary rounded-3xl flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              SkinCare AI
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Your personal skincare companion
            </p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Discover your perfect routine
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Get personalized skincare recommendations based on AI analysis of your skin type, concerns, and goals.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="space-y-4 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="card-shadow border-0">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 gradient-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4">
          <Button
            onClick={() => setLocation("/onboarding")}
            className="w-full btn-primary py-4 text-lg"
          >
            Get Started
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Takes 2 minutes • No account required
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">AI</div>
              <div className="text-xs text-gray-500">Powered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">Free</div>
              <div className="text-xs text-gray-500">Always</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">Private</div>
              <div className="text-xs text-gray-500">& Secure</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}