import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sun, Moon, Info } from "lucide-react";

export default function Routines() {
  const [, setLocation] = useLocation();

  const morningRoutine = [
    { name: "Gentle Cleanser", purpose: "Remove overnight impurities", order: 1 },
    { name: "Vitamin C Serum", purpose: "Antioxidant protection", order: 2 },
    { name: "Moisturizer", purpose: "Hydrate and protect skin", order: 3 },
    { name: "Sunscreen SPF 30+", purpose: "UV protection", order: 4 }
  ];

  const eveningRoutine = [
    { name: "Gentle Cleanser", purpose: "Remove daily impurities", order: 1 },
    { name: "Treatment Serum", purpose: "Target specific concerns", order: 2 },
    { name: "Night Moisturizer", purpose: "Deep overnight hydration", order: 3 }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mobile-container py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold ml-4">Your Routines</h1>
        </div>

        <div className="space-y-6">
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sun className="w-5 h-5 text-orange-500" />
                <span>Morning Routine</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {morningRoutine.map((product) => (
                <div key={product.order} className="flex items-start space-x-4 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {product.order}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.purpose}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Info className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Moon className="w-5 h-5 text-indigo-500" />
                <span>Evening Routine</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {eveningRoutine.map((product) => (
                <div key={product.order} className="flex items-start space-x-4 p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                  <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {product.order}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.purpose}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Info className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}