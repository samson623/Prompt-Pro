import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Check, Crown, Sparkles, Target, Users, Zap } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

// Load Stripe with fallback for preview mode
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY ? 
  loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) : 
  null;

const PLAN_CONFIGS = {
  basic: { 
    name: "Basic", 
    price: "$1", 
    prompts: 75, 
    description: "Great for regular users",
    features: ["75 prompts per month", "AI-powered enhancement", "Contextual questionnaires", "Custom constraints"]
  },
  plus: { 
    name: "Plus", 
    price: "$3", 
    prompts: 300, 
    description: "Most popular plan", 
    popular: true,
    features: ["300 prompts per month", "AI-powered enhancement", "Contextual questionnaires", "Custom constraints", "Priority support"]
  },
  pro: { 
    name: "Pro", 
    price: "$5", 
    prompts: 500, 
    description: "For power users",
    features: ["500 prompts per month", "AI-powered enhancement", "Contextual questionnaires", "Custom constraints", "Priority support", "Advanced analytics"]
  },
};

interface CheckoutFormProps {
  plan: string;
  clientSecret: string;
  onSuccess: () => void;
}

function CheckoutForm({ plan, clientSecret, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/?payment=success`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: `You've successfully subscribed to the ${PLAN_CONFIGS[plan as keyof typeof PLAN_CONFIGS]?.name} plan!`,
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 transition-all duration-200"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            Processing Payment...
          </>
        ) : (
          <>
            <Crown className="w-4 h-4 mr-2" />
            Subscribe to {PLAN_CONFIGS[plan as keyof typeof PLAN_CONFIGS]?.name}
          </>
        )}
      </Button>
    </form>
  );
}

export default function Subscribe() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string>("");
  const [showCheckout, setShowCheckout] = useState(false);

  // Get plan from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const planFromUrl = urlParams.get('plan');
    if (planFromUrl && PLAN_CONFIGS[planFromUrl as keyof typeof PLAN_CONFIGS]) {
      setSelectedPlan(planFromUrl);
    }
  }, [location]);

  // Redirect if not authenticated
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

  const createSubscriptionMutation = useMutation({
    mutationFn: async (plan: string) => {
      const response = await apiRequest("POST", "/api/create-subscription", { plan });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setShowCheckout(true);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    },
  });

  const handleSelectPlan = (plan: string) => {
    setSelectedPlan(plan);
    createSubscriptionMutation.mutate(plan);
  };

  const handlePaymentSuccess = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="text-slate-400 hover:text-slate-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Prompt Enhancer</h1>
                <p className="text-xs text-slate-400">Subscription</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!showCheckout ? (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                Choose Your Plan
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Unlock the full potential of AI-powered prompt enhancement. Select the plan that fits your needs.
              </p>
            </div>

            {/* Current Plan Status */}
            {user.currentPlan && user.currentPlan !== 'free' && (
              <Card className="bg-slate-800 border-slate-700 mb-8 max-w-md mx-auto">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-2">Current Plan</h3>
                  <p className="text-slate-300">
                    You're currently on the <strong>{user.currentPlan}</strong> plan
                  </p>
                  <p className="text-sm text-slate-400 mt-2">
                    {user.promptsUsed} / {user.promptsLimit} prompts used this month
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Pricing Plans */}
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {Object.entries(PLAN_CONFIGS).map(([planKey, plan]) => (
                <Card 
                  key={planKey}
                  className={`bg-slate-800 border-slate-700 relative transition-all duration-200 hover:border-indigo-500 ${
                    plan.popular ? 'ring-2 ring-indigo-500 scale-105' : ''
                  } ${selectedPlan === planKey ? 'ring-2 ring-purple-500' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-indigo-500 text-white font-bold px-4 py-1">
                        MOST POPULAR
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-slate-50">{plan.name}</CardTitle>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-slate-50">{plan.price}</div>
                      <div className="text-slate-400">/month</div>
                      <p className="text-sm text-slate-300">{plan.description}</p>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-indigo-400">{plan.prompts} prompts</div>
                      <div className="text-sm text-slate-400">per month</div>
                    </div>
                    
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-slate-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button
                      onClick={() => handleSelectPlan(planKey)}
                      disabled={createSubscriptionMutation.isPending || user.currentPlan === planKey}
                      className={`w-full font-semibold py-3 transition-all duration-200 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                      } ${user.currentPlan === planKey ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {createSubscriptionMutation.isPending && selectedPlan === planKey ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Setting up...
                        </>
                      ) : user.currentPlan === planKey ? (
                        'Current Plan'
                      ) : (
                        <>
                          <Crown className="w-4 h-4 mr-2" />
                          Choose {plan.name}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Features Section */}
            <div className="mt-20">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold mb-4 text-slate-50">What You Get</h3>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  All plans include our core features designed to enhance your AI prompts and improve response quality.
                </p>
              </div>

              <div className="grid md:grid-cols-4 gap-8">
                <Card className="bg-slate-800 border-slate-700 text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h4 className="font-semibold text-slate-50 mb-2">AI Enhancement</h4>
                    <p className="text-sm text-slate-400">
                      Advanced AI algorithms to refine and optimize your prompts
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700 text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-purple-400" />
                    </div>
                    <h4 className="font-semibold text-slate-50 mb-2">Smart Questions</h4>
                    <p className="text-sm text-slate-400">
                      Contextual questionnaires to understand your specific needs
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700 text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Target className="w-6 h-6 text-green-400" />
                    </div>
                    <h4 className="font-semibold text-slate-50 mb-2">Custom Constraints</h4>
                    <p className="text-sm text-slate-400">
                      Fine-tune your prompts with specific requirements and preferences
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700 text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-6 h-6 text-orange-400" />
                    </div>
                    <h4 className="font-semibold text-slate-50 mb-2">Instant Results</h4>
                    <p className="text-sm text-slate-400">
                      Get enhanced prompts in seconds with professional quality
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          // Checkout Form
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4 text-slate-50">Complete Your Subscription</h2>
              <p className="text-slate-300">
                You're subscribing to the <strong>{PLAN_CONFIGS[selectedPlan as keyof typeof PLAN_CONFIGS]?.name}</strong> plan
              </p>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-50 text-center">
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clientSecret && (
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                    <CheckoutForm 
                      plan={selectedPlan} 
                      clientSecret={clientSecret} 
                      onSuccess={handlePaymentSuccess}
                    />
                  </Elements>
                )}
              </CardContent>
            </Card>

            <div className="text-center mt-8">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCheckout(false);
                  setClientSecret("");
                  setSelectedPlan("");
                }}
                className="text-slate-400 hover:text-slate-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Plans
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
