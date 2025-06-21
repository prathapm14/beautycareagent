import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, Moon, Shield, User, HelpCircle } from "lucide-react";

export default function Settings() {
  const [, setLocation] = useLocation();

  const settingsGroups = [
    {
      title: "Profile",
      icon: User,
      items: [
        { label: "Edit Profile", action: () => setLocation("/onboarding") },
        { label: "Skin Analysis History", action: () => {} },
        { label: "Export Data", action: () => {} }
      ]
    },
    {
      title: "Notifications",
      icon: Bell,
      items: [
        { label: "Routine Reminders", toggle: true, enabled: true },
        { label: "Progress Updates", toggle: true, enabled: false },
        { label: "New Features", toggle: true, enabled: true }
      ]
    },
    {
      title: "Appearance",
      icon: Moon,
      items: [
        { label: "Dark Mode", toggle: true, enabled: false },
        { label: "Large Text", toggle: true, enabled: false }
      ]
    },
    {
      title: "Privacy",
      icon: Shield,
      items: [
        { label: "Data Usage", action: () => {} },
        { label: "Delete Account", action: () => {} }
      ]
    },
    {
      title: "Support",
      icon: HelpCircle,
      items: [
        { label: "Help Center", action: () => {} },
        { label: "Contact Support", action: () => {} },
        { label: "App Version 1.0.0", disabled: true }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mobile-container py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold ml-4">Settings</h1>
        </div>

        <div className="space-y-6">
          {settingsGroups.map((group, groupIndex) => (
            <Card key={groupIndex} className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <group.icon className="w-5 h-5 text-primary" />
                  <span>{group.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between py-2">
                    <span className={`${item.disabled ? 'text-muted-foreground' : ''}`}>
                      {item.label}
                    </span>
                    {item.toggle ? (
                      <Switch defaultChecked={item.enabled} />
                    ) : !item.disabled ? (
                      <Button variant="ghost" size="sm" onClick={item.action}>
                        →
                      </Button>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}