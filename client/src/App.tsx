import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Welcome from "@/pages/welcome";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import SkinAnalysis from "@/pages/skin-analysis";
import Routines from "@/pages/routines";
import Chat from "@/pages/chat";
import Diary from "@/pages/diary";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/analysis" component={SkinAnalysis} />
      <Route path="/routines" component={Routines} />
      <Route path="/chat" component={Chat} />
      <Route path="/diary" component={Diary} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
