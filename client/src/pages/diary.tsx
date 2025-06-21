import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, Plus, Calendar } from "lucide-react";

export default function Diary() {
  const [, setLocation] = useLocation();
  const [showAddEntry, setShowAddEntry] = useState(false);

  const diaryEntries = [
    {
      id: 1,
      date: "Today",
      mood: "good",
      condition: "clear",
      notes: "Skin looking great today! New serum is working well.",
      photoUrl: null
    },
    {
      id: 2,
      date: "Yesterday", 
      mood: "neutral",
      condition: "breakout",
      notes: "Small breakout on forehead, probably stress related.",
      photoUrl: null
    }
  ];

  const moodOptions = [
    { value: "good", label: "😊 Good", color: "bg-green-100 text-green-800" },
    { value: "neutral", label: "😐 Neutral", color: "bg-yellow-100 text-yellow-800" },
    { value: "bad", label: "😞 Bad", color: "bg-red-100 text-red-800" }
  ];

  const conditionOptions = [
    { value: "clear", label: "✨ Clear", color: "bg-blue-100 text-blue-800" },
    { value: "breakout", label: "🔴 Breakout", color: "bg-red-100 text-red-800" },
    { value: "dry", label: "🏜️ Dry", color: "bg-orange-100 text-orange-800" },
    { value: "oily", label: "💧 Oily", color: "bg-cyan-100 text-cyan-800" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mobile-container py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold ml-4">Skin Diary</h1>
          </div>
          <Button 
            onClick={() => setShowAddEntry(!showAddEntry)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Entry
          </Button>
        </div>

        {showAddEntry && (
          <Card className="mb-6 card-shadow border-0">
            <CardHeader>
              <CardTitle>New Diary Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Mood</label>
                  <div className="space-y-2">
                    {moodOptions.map((mood) => (
                      <Button 
                        key={mood.value}
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        {mood.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Condition</label>
                  <div className="space-y-2">
                    {conditionOptions.map((condition) => (
                      <Button 
                        key={condition.value}
                        variant="outline" 
                        className="w-full justify-start text-xs"
                      >
                        {condition.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Photo</label>
                <Button variant="outline" className="w-full">
                  <Camera className="w-4 h-4 mr-2" />
                  Add Photo
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Notes</label>
                <Textarea 
                  placeholder="How is your skin feeling today?"
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowAddEntry(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 btn-primary"
                  onClick={() => setShowAddEntry(false)}
                >
                  Save Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {diaryEntries.map((entry) => {
            const mood = moodOptions.find(m => m.value === entry.mood);
            const condition = conditionOptions.find(c => c.value === entry.condition);
            
            return (
              <Card key={entry.id} className="card-shadow border-0">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{entry.date}</span>
                    </div>
                    <div className="flex space-x-2">
                      {mood && (
                        <Badge className={mood.color}>
                          {mood.label}
                        </Badge>
                      )}
                      {condition && (
                        <Badge className={condition.color}>
                          {condition.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {entry.notes}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}