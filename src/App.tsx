import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CreateLeaderboard from "./pages/CreateLeaderboard";
import LeaderboardDetail from "./pages/LeaderboardDetail";
import LeaderboardSettings from "./pages/LeaderboardSettings";
import NotFound from "./pages/NotFound";
import { SoundToggle } from "./components/SoundToggle";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner 
        theme="dark"
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
            border: '2px solid hsl(var(--border))',
            fontFamily: '"Press Start 2P", cursive',
            fontSize: '10px',
          },
        }}
      />
      <SoundToggle />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateLeaderboard />} />
          <Route path="/leaderboard/:id" element={<LeaderboardDetail />} />
          <Route path="/leaderboard/:id/settings" element={<LeaderboardSettings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
