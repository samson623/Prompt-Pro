import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

interface Question {
  id: string;
  question: string;
  type: "multiple-choice" | "text" | "boolean";
  options?: string[];
}

interface QuestionnaireData {
  questionnaireId: string;
  questions: Question[];
}

interface AIQuestionnaireProps {
  isOpen: boolean;
  onClose: () => void;
  questionnaireData: QuestionnaireData | null;
  onComplete: (answers: any[]) => void;
  isLoading: boolean;
}

export default function AIQuestionnaire({
  isOpen,
  onClose,
  questionnaireData,
  onComplete,
  isLoading,
}: AIQuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);

  useEffect(() => {
    if (questionnaireData) {
      setCurrentQuestion(0);
      setAnswers(new Array(questionnaireData.questions.length).fill(""));
    }
  }, [questionnaireData]);

  if (!questionnaireData) return null;

  const { questions } = questionnaireData;
  const totalQuestions = questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Complete questionnaire
      onComplete(answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const canProceed = answers[currentQuestion] && answers[currentQuestion].trim() !== "";
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 dark:bg-slate-900 border-slate-800 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-50 dark:text-slate-50">
            AI Enhancement Questions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Introduction */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <p className="text-slate-300 dark:text-slate-300">
              I'll ask you a few questions to better understand your prompt and create the most effective enhancement.
            </p>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-400 dark:text-slate-400">
              <span>Question {currentQuestion + 1} of {totalQuestions}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current Question */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-slate-200 dark:text-slate-200">
              {questions[currentQuestion]?.question}
            </h4>

            {/* Question Input */}
            {questions[currentQuestion]?.type === "multiple-choice" && questions[currentQuestion]?.options && (
              <RadioGroup
                value={answers[currentQuestion] || ""}
                onValueChange={handleAnswerChange}
                className="space-y-3"
              >
                {questions[currentQuestion].options!.map((option, index) => (
                  <div key={index} className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-slate-700 dark:border-slate-700 hover:border-indigo-500 transition-colors">
                    <RadioGroupItem value={option} id={`option-${index}`} className="mt-1" />
                    <Label htmlFor={`option-${index}`} className="text-slate-200 dark:text-slate-200 cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {questions[currentQuestion]?.type === "text" && (
              <Textarea
                value={answers[currentQuestion] || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="min-h-[100px] bg-slate-800 dark:bg-slate-800 border-slate-700 dark:border-slate-700 text-slate-50 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-400"
                placeholder="Type your answer here..."
              />
            )}

            {questions[currentQuestion]?.type === "boolean" && (
              <RadioGroup
                value={answers[currentQuestion] || ""}
                onValueChange={handleAnswerChange}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-slate-700 dark:border-slate-700 hover:border-indigo-500 transition-colors">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes" className="text-slate-200 dark:text-slate-200 cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-slate-700 dark:border-slate-700 hover:border-indigo-500 transition-colors">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no" className="text-slate-200 dark:text-slate-200 cursor-pointer">No</Label>
                </div>
              </RadioGroup>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-700 dark:border-slate-700">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="text-slate-400 dark:text-slate-400 hover:text-slate-200 dark:hover:text-slate-200 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed || isLoading}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Generating...
                </>
              ) : isLastQuestion ? (
                <>
                  Generate Enhanced Prompt
                  <Sparkles className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
