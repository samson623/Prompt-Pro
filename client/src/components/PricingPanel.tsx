import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Crown, Zap, Target, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  promptsUsed: number;
  promptsLimit: number;
  currentPlan: string;
}

interface PricingPanelProps {
  user: User;
}

const PLAN_CONFIGS = {
  free: { name: "Free", price: "$0", prompts: 10, description: "Perfect for trying out" },
  basic: { name: "Basic", price: "$1", prompts: 75, description: "Great for regular users" },
  plus: { name: "Plus", price: "$3", prompts: 300, description: "Most popular plan", popular: true },
  pro: { name: "Pro", price: "$5", prompts: 500, description: "For power users" },
};

export default function PricingPanel({ user }: PricingPanelProps) {
  const { toast } = useToast();
  
  const usagePercentage = Math.round((user.promptsUsed / user.promptsLimit) * 100);
  const currentPlanConfig = PLAN_CONFIGS[user.currentPlan as keyof typeof PLAN_CONFIGS] || PLAN_CONFIGS.free;

  const handleUpgrade = (plan: string) => {
    if (plan === user.currentPlan) {
      toast({
        title: "Current Plan",
        description: "You're already on this plan",
      });
      return;
    }

    // Redirect to subscription page
    window.location.href = `/subscribe?plan=${plan}`;
  };

  return (
    <Card className="bg-slate-900 dark:bg-slate-900 border-slate-800 dark:border-slate-800 shadow-lg sticky top-24">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-slate-50 dark:text-slate-50 mb-6 text-center">Pricing Plans</h3>
        
        {/* Current Plan Status */}
        <Card className="bg-slate-800 dark:bg-slate-800 border-slate-700 dark:border-slate-700 mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-slate-200 dark:text-slate-200 text-center">
              Current Plan: {currentPlanConfig.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-2">
            <div className="text-sm text-slate-300 dark:text-slate-300">
              {user.promptsUsed} / {user.promptsLimit} prompts used
            </div>
            <Progress value={usagePercentage} className="h-2" />
            <div className="text-xs text-slate-400 dark:text-slate-400">
              {usagePercentage}% of monthly limit used
            </div>
          </CardContent>
        </Card>

        {/* Pricing Options */}
        <div className="space-y-4">
          {Object.entries(PLAN_CONFIGS).map(([planKey, plan]) => {
            const isCurrentPlan = planKey === user.currentPlan;
            const canUpgrade = !isCurrentPlan && planKey !== 'free';
            
            return (
              <Card 
                key={planKey} 
                className={`bg-slate-800 dark:bg-slate-800 border-slate-700 dark:border-slate-700 ${
                  plan.popular ? 'ring-2 ring-indigo-500' : ''
                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                <CardContent className="p-4">
                  {plan.popular && (
                    <div className="text-center mb-2">
                      <span className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div className="text-center mb-2">
                      <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        CURRENT PLAN
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center space-y-2">
                    <h4 className="font-semibold text-slate-200 dark:text-slate-200">{plan.name}</h4>
                    <div className="text-2xl font-bold text-slate-50 dark:text-slate-50">{plan.price}</div>
                    <div className="text-sm text-slate-400 dark:text-slate-400">{plan.prompts} prompts/month</div>
                    <p className="text-xs text-slate-400 dark:text-slate-400">{plan.description}</p>
                    
                    {canUpgrade ? (
                      <Button 
                        onClick={() => handleUpgrade(planKey)}
                        className={`w-full font-medium py-2 rounded-lg transition-colors duration-200 ${
                          plan.popular 
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white' 
                            : 'bg-slate-700 dark:bg-slate-700 hover:bg-slate-600 dark:hover:bg-slate-600 text-slate-200 dark:text-slate-200'
                        }`}
                      >
                        Upgrade to {plan.name}
                      </Button>
                    ) : (
                      <Button 
                        disabled
                        className="w-full bg-slate-700 dark:bg-slate-700 text-slate-400 dark:text-slate-400 cursor-not-allowed"
                      >
                        {isCurrentPlan ? 'Current Plan' : 'Downgrade Not Available'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features List */}
        <div className="mt-6 pt-6 border-t border-slate-700 dark:border-slate-700">
          <h4 className="text-sm font-medium text-slate-300 dark:text-slate-300 mb-3">All Plans Include:</h4>
          <ul className="space-y-2 text-sm text-slate-400 dark:text-slate-400">
            <li className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-indigo-500" />
              <span>AI-powered enhancement</span>
            </li>
            <li className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-indigo-500" />
              <span>Contextual questionnaires</span>
            </li>
            <li className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-indigo-500" />
              <span>Custom constraints</span>
            </li>
            <li className="flex items-center space-x-2">
              <Crown className="w-4 h-4 text-indigo-500" />
              <span>Professional templates</span>
            </li>
          </ul>
        </div>

        {/* Usage Statistics */}
        <div className="mt-6 pt-6 border-t border-slate-700 dark:border-slate-700">
          <h4 className="text-sm font-medium text-slate-300 dark:text-slate-300 mb-3">Usage Statistics</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 dark:text-slate-400">This month:</span>
              <span className="text-slate-200 dark:text-slate-200">{user.promptsUsed} prompts</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 dark:text-slate-400">Remaining:</span>
              <span className="text-slate-200 dark:text-slate-200">{user.promptsLimit - user.promptsUsed} prompts</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
