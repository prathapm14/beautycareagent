import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Mic, ArrowLeft } from "lucide-react";

export default function SkinAnalysis() {
  const [, setLocation] = useLocation();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageUpload = () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setLocation("/dashboard");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mobile-container py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold ml-4">Skin Analysis</h1>
        </div>

        <Card className="card-shadow border-0">
          <CardHeader className="text-center">
            <CardTitle>AI Skin Diagnosis</CardTitle>
            <p className="text-muted-foreground">Upload a photo for instant analysis</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Take or upload a clear photo of your face</p>
              <div className="space-y-3">
                <Button className="w-full btn-primary" onClick={handleImageUpload} disabled={isAnalyzing}>
                  <Camera className="w-5 h-5 mr-2" />
                  {isAnalyzing ? "Analyzing..." : "Take Photo"}
                </Button>
                <Button variant="outline" className="w-full" onClick={handleImageUpload} disabled={isAnalyzing}>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload from Gallery
                </Button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium mb-3">Voice Description</h3>
              <Button variant="outline" className="w-full">
                <Mic className="w-5 h-5 mr-2" />
                Describe your concerns...
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}