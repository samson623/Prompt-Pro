import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Target, Users } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Prompt Enhancer</h1>
                <p className="text-xs text-slate-400">Professional AI Enhancement</p>
              </div>
            </div>
            
            <Button onClick={handleLogin} className="bg-indigo-600 hover:bg-indigo-700">
              Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Enhance Your AI Prompts
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Get better AI responses with our intelligent prompt enhancement tool. 
            Our AI asks clarifying questions to create optimized prompts tailored to your needs.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-lg px-8 py-4"
          >
            Start Enhancing Prompts
            <Sparkles className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">How It Works</h3>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Our intelligent system guides you through a simple process to create the perfect prompt.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-indigo-400" />
                </div>
                <CardTitle className="text-slate-50">1. Enter Your Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">
                  Start with any prompt, no matter how basic. Our AI will help you refine it.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-slate-50">2. Answer Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">
                  Our AI asks targeted questions to understand your specific needs and context.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <CardTitle className="text-slate-50">3. Get Enhanced Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">
                  Receive a professionally crafted prompt that gets better AI responses.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h3>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Start free, upgrade when you need more. All plans include our full enhancement features.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Free", price: "$0", prompts: "10", description: "Perfect for trying out the service" },
              { name: "Basic", price: "$1", prompts: "75", description: "Great for regular users" },
              { name: "Plus", price: "$3", prompts: "300", description: "Most popular plan", popular: true },
              { name: "Pro", price: "$5", prompts: "500", description: "For power users" },
            ].map((plan) => (
              <Card key={plan.name} className={`bg-slate-800 border-slate-700 ${plan.popular ? 'ring-2 ring-indigo-500' : ''}`}>
                <CardHeader>
                  {plan.popular && (
                    <div className="text-center">
                      <span className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  <CardTitle className="text-center text-slate-50">{plan.name}</CardTitle>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-slate-50">{plan.price}</span>
                    <span className="text-slate-400">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-300 font-medium mb-2">{plan.prompts} prompts/month</p>
                  <p className="text-sm text-slate-400">{plan.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
