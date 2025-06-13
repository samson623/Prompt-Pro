import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import PromptEnhancer from "@/components/PromptEnhancer";
import PricingPanel from "@/components/PricingPanel";
import { Sparkles, Moon, Sun, User, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 text-slate-50 dark:text-slate-50">
      {/* Header */}
      <header className="bg-slate-900 dark:bg-slate-900 border-b border-slate-800 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-50 dark:text-slate-50">Prompt Enhancer</h1>
                  <p className="text-xs text-slate-400 dark:text-slate-400">Professional AI Enhancement</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Usage Indicator */}
              <div className="hidden sm:flex items-center space-x-2 bg-slate-800 dark:bg-slate-800 px-3 py-2 rounded-lg">
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium text-slate-200 dark:text-slate-200">{user.promptsUsed || 0}</span>
                <span className="text-slate-400 dark:text-slate-400 text-sm">/</span>
                <span className="text-sm font-medium text-slate-200 dark:text-slate-200">{user.promptsLimit || 10}</span>
                <span className="text-slate-400 dark:text-slate-400 text-sm">prompts</span>
              </div>
              
              {/* Theme Toggle */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleTheme}
                className="bg-slate-800 dark:bg-slate-800 hover:bg-slate-700 dark:hover:bg-slate-700"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              
              {/* Profile */}
              <div className="flex items-center space-x-2">
                {user.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-slate-400 dark:text-slate-400 hover:text-slate-200 dark:hover:text-slate-200"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Enhance Your AI Prompts
          </h2>
          <p className="text-xl text-slate-300 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Refine your prompts for better AI responses with granular control and professional enhancement tools.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Enhancement Panel */}
          <div className="lg:col-span-2">
            <PromptEnhancer user={user} />
          </div>

          {/* Pricing Panel */}
          <div className="lg:col-span-1">
            <PricingPanel user={user} />
          </div>
        </div>
      </main>
    </div>
  );
}
