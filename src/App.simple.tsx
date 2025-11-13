import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const SimpleApp = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>AI-Assist-IDE</h1>
        <p>If you can see this, the app is working!</p>
        <p>Current URL: {window.location.href}</p>
        <p>Path: {window.location.pathname}</p>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default SimpleApp;
