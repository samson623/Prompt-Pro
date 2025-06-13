import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Mic, X, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import AIQuestionnaire from "./AIQuestionnaire";
import { isUnauthorizedError } from "@/lib/authUtils";

interface User {
  id: string;
  promptsUsed: number;
  promptsLimit: number;
  currentPlan: string;
}

interface PromptEnhancerProps {
  user: User;
}

interface EnhancementOptions {
  variations: number;
  style: string;
  format: string;
  length: string;
  constraints: {
    statistics: boolean;
    examples: boolean;
    balanced: boolean;
    citations: boolean;
    stepByStep: boolean;
    avoidJargon: boolean;
  };
  customInstructions: string;
}

export default function PromptEnhancer({ user }: PromptEnhancerProps) {
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [enhancementOptions, setEnhancementOptions] = useState<EnhancementOptions>({
    variations: 3,
    style: "default",
    format: "default",
    length: "default",
    constraints: {
      statistics: false,
      examples: false,
      balanced: false,
      citations: false,
      stepByStep: true,
      avoidJargon: false,
    },
    customInstructions: "you are a Senior Software Engineer – Web Apps",
  });
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireData, setQuestionnaireData] = useState<any>(null);
  const [enhancedPrompts, setEnhancedPrompts] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const generateQuestionsMutation = useMutation({
    mutationFn: async () => {
      if (!originalPrompt.trim()) {
        throw new Error("Please enter a prompt first");
      }
      
      if (user.promptsUsed >= user.promptsLimit) {
        throw new Error("Usage limit reached. Please upgrade your plan.");
      }

      const response = await apiRequest("POST", "/api/generate-questions", {
        originalPrompt,
        enhancementOptions,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setQuestionnaireData(data);
      setShowQuestionnaire(true);
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
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const enhancePromptMutation = useMutation({
    mutationFn: async (answers: any[]) => {
      const response = await apiRequest("POST", "/api/enhance-prompt", {
        questionnaireId: questionnaireData.questionnaireId,
        answers,
        enhancementOptions,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setEnhancedPrompts([data.enhancedPrompt]);
      setShowQuestionnaire(false);
      toast({
        title: "Success",
        description: "Your prompt has been enhanced successfully!",
      });
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
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEnhancePrompt = () => {
    generateQuestionsMutation.mutate();
  };

  const handleQuestionnaireComplete = (answers: any[]) => {
    enhancePromptMutation.mutate(answers);
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      toast({
        title: "Copied",
        description: "Enhanced prompt copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const updateConstraint = (key: keyof EnhancementOptions['constraints'], value: boolean) => {
    setEnhancementOptions(prev => ({
      ...prev,
      constraints: {
        ...prev.constraints,
        [key]: value,
      },
    }));
  };

  const clearPrompt = () => {
    setOriginalPrompt("");
    setEnhancedPrompts([]);
  };

  return (
    <>
      <Card className="bg-slate-900 dark:bg-slate-900 border-slate-800 dark:border-slate-800 shadow-lg">
        <CardContent className="p-6">
          {/* Original Prompt Input */}
          <div className="mb-8">
            <Label className="text-sm font-medium text-slate-200 dark:text-slate-200 mb-3 block">
              Your Original Prompt:
            </Label>
            <div className="relative">
              <Textarea
                value={originalPrompt}
                onChange={(e) => setOriginalPrompt(e.target.value)}
                className="min-h-[120px] bg-slate-800 dark:bg-slate-800 border-slate-700 dark:border-slate-700 text-slate-50 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Enter your prompt here..."
              />
              <div className="absolute top-3 right-3 flex space-x-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 dark:text-slate-400 hover:text-slate-200 dark:hover:text-slate-200">
                  <Mic className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={clearPrompt} className="h-8 w-8 p-0 text-slate-400 dark:text-slate-400 hover:text-slate-200 dark:hover:text-slate-200">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Enhancement Options */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-200 dark:text-slate-200 mb-4">Enhancement Options</h3>
            
            {/* Add Context Button */}
            <div className="mb-6">
              <Button variant="outline" className="bg-slate-800 dark:bg-slate-800 border-slate-700 dark:border-slate-700 text-slate-300 dark:text-slate-300 hover:bg-slate-700 dark:hover:bg-slate-700">
                <span>Add relevant context</span>
              </Button>
            </div>

            {/* Enhancement Controls Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Number of Variations */}
              <div>
                <Label className="text-sm font-medium text-slate-300 dark:text-slate-300 mb-2 block">Number of variations:</Label>
                <Select value={enhancementOptions.variations.toString()} onValueChange={(value) => setEnhancementOptions(prev => ({ ...prev, variations: parseInt(value) }))}>
                  <SelectTrigger className="bg-slate-800 dark:bg-slate-800 border-slate-700 dark:border-slate-700 text-slate-50 dark:text-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Variations</SelectItem>
                    <SelectItem value="5">5 Variations</SelectItem>
                    <SelectItem value="10">10 Variations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Style/Tone */}
              <div>
                <Label className="text-sm font-medium text-slate-300 dark:text-slate-300 mb-2 block">Style/Tone:</Label>
                <Select value={enhancementOptions.style} onValueChange={(value) => setEnhancementOptions(prev => ({ ...prev, style: value }))}>
                  <SelectTrigger className="bg-slate-800 dark:bg-slate-800 border-slate-700 dark:border-slate-700 text-slate-50 dark:text-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Format */}
              <div>
                <Label className="text-sm font-medium text-slate-300 dark:text-slate-300 mb-2 block">Format (for target AI):</Label>
                <Select value={enhancementOptions.format} onValueChange={(value) => setEnhancementOptions(prev => ({ ...prev, format: value }))}>
                  <SelectTrigger className="bg-slate-800 dark:bg-slate-800 border-slate-700 dark:border-slate-700 text-slate-50 dark:text-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="structured">Structured</SelectItem>
                    <SelectItem value="conversational">Conversational</SelectItem>
                    <SelectItem value="directive">Directive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Length */}
              <div>
                <Label className="text-sm font-medium text-slate-300 dark:text-slate-300 mb-2 block">Length (for target AI):</Label>
                <Select value={enhancementOptions.length} onValueChange={(value) => setEnhancementOptions(prev => ({ ...prev, length: value }))}>
                  <SelectTrigger className="bg-slate-800 dark:bg-slate-800 border-slate-700 dark:border-slate-700 text-slate-50 dark:text-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="brief">Brief</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Custom Constraints */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-200 dark:text-slate-200 mb-4">Custom Constraints:</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {Object.entries(enhancementOptions.constraints).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-3">
                  <Checkbox
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => updateConstraint(key as keyof EnhancementOptions['constraints'], checked as boolean)}
                    className="border-slate-600 dark:border-slate-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                  />
                  <Label htmlFor={key} className="text-slate-300 dark:text-slate-300 cursor-pointer">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace('Step By Step', 'Step-by-step approach')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Instructions */}
          <div className="mb-8">
            <Label className="text-sm font-medium text-slate-200 dark:text-slate-200 mb-3 block">
              Custom Instructions for Enhancer AI:
            </Label>
            <Textarea
              value={enhancementOptions.customInstructions}
              onChange={(e) => setEnhancementOptions(prev => ({ ...prev, customInstructions: e.target.value }))}
              className="min-h-[80px] bg-slate-800 dark:bg-slate-800 border-slate-700 dark:border-slate-700 text-slate-50 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Additional instructions for the enhancer..."
            />
          </div>

          {/* Enhance Button */}
          <Button 
            onClick={handleEnhancePrompt}
            disabled={generateQuestionsMutation.isPending || !originalPrompt.trim()}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generateQuestionsMutation.isPending ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Generating Questions...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Enhance My Prompt
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Enhanced Prompts Results */}
      {enhancedPrompts.length > 0 && (
        <Card className="mt-8 bg-slate-900 dark:bg-slate-900 border-slate-800 dark:border-slate-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-200 dark:text-slate-200">Enhanced Prompts</h3>
              <span className="text-sm text-slate-400 dark:text-slate-400">Generated just now</span>
            </div>
            
            <div className="space-y-4">
              {enhancedPrompts.map((prompt, index) => (
                <div key={index} className="bg-slate-800 dark:bg-slate-800 rounded-lg p-4 border border-slate-700 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-indigo-400 dark:text-indigo-400">Enhanced Version {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(prompt, index)}
                      className="text-slate-400 dark:text-slate-400 hover:text-slate-200 dark:hover:text-slate-200"
                    >
                      {copiedIndex === index ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-slate-200 dark:text-slate-200 leading-relaxed">{prompt}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Questionnaire Modal */}
      <AIQuestionnaire
        isOpen={showQuestionnaire}
        onClose={() => setShowQuestionnaire(false)}
        questionnaireData={questionnaireData}
        onComplete={handleQuestionnaireComplete}
        isLoading={enhancePromptMutation.isPending}
      />
    </>
  );
}
