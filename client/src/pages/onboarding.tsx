import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiRequest } from "@/lib/queryClient";
import { onboardingSchema, type OnboardingData } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, User, Droplets, AlertCircle } from "lucide-react";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      email: "",
      skinType: "combination",
      concerns: [],
      allergies: []
    }
  });

  const onboardingMutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
      const res = await apiRequest("POST", "/api/onboard", data);
      return await res.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("userId", data.user.id.toString());
      toast({
        title: "Welcome to SkinCare AI!",
        description: "Your profile has been created successfully.",
      });
      setLocation("/dashboard");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create your profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const skinTypes = [
    { value: "oily", label: "Oily", description: "Shiny, enlarged pores, prone to blackheads" },
    { value: "dry", label: "Dry", description: "Tight, flaky, rough texture" },
    { value: "combination", label: "Combination", description: "Oily T-zone, dry cheeks" },
    { value: "sensitive", label: "Sensitive", description: "Easily irritated, reactive to products" }
  ];

  const concerns = [
    { value: "acne", label: "Acne", icon: "🔴" },
    { value: "dark_spots", label: "Dark Spots", icon: "🟤" },
    { value: "wrinkles", label: "Wrinkles", icon: "📏" },
    { value: "dullness", label: "Dullness", icon: "😴" },
    { value: "redness", label: "Redness", icon: "🔴" }
  ];

  const [allergiesInput, setAllergiesInput] = useState("");
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);

  const addAllergy = () => {
    if (allergiesInput.trim() && !selectedAllergies.includes(allergiesInput.trim())) {
      const newAllergies = [...selectedAllergies, allergiesInput.trim()];
      setSelectedAllergies(newAllergies);
      form.setValue("allergies", newAllergies);
      setAllergiesInput("");
    }
  };

  const removeAllergy = (allergy: string) => {
    const newAllergies = selectedAllergies.filter(a => a !== allergy);
    setSelectedAllergies(newAllergies);
    form.setValue("allergies", newAllergies);
  };

  const toggleConcern = (concern: string) => {
    const currentConcerns = form.getValues("concerns");
    const newConcerns = currentConcerns.includes(concern as any)
      ? currentConcerns.filter(c => c !== concern)
      : [...currentConcerns, concern as any];
    form.setValue("concerns", newConcerns);
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const onSubmit = (data: OnboardingData) => {
    onboardingMutation.mutate(data);
  };

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="mobile-container py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={step === 1 ? () => setLocation("/") : prevStep}
            className="touch-target"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-semibold">Skin Analysis</h1>
            <p className="text-sm text-muted-foreground">Step {step} of 3</p>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="mb-8" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <Card className="card-shadow border-0">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle>Tell us about yourself</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Your Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter your name"
                            className="input-focus py-3 text-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email"
                            placeholder="your@email.com"
                            className="input-focus py-3 text-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!form.watch("name") || !form.watch("email")}
                    className="w-full btn-primary py-4 text-lg"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Skin Type & Concerns */}
            {step === 2 && (
              <div className="space-y-6">
                <Card className="card-shadow border-0">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Droplets className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle>What's your skin type?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="skinType"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-3"
                            >
                              {skinTypes.map((type) => (
                                <div key={type.value} className="flex items-start space-x-3">
                                  <RadioGroupItem 
                                    value={type.value} 
                                    id={type.value}
                                    className="mt-1"
                                  />
                                  <div className="flex-1">
                                    <Label 
                                      htmlFor={type.value}
                                      className="font-medium cursor-pointer"
                                    >
                                      {type.label}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                      {type.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className="card-shadow border-0">
                  <CardHeader>
                    <CardTitle>Top skin concerns</CardTitle>
                    <p className="text-sm text-muted-foreground">Select all that apply</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {concerns.map((concern) => {
                        const isSelected = form.watch("concerns").includes(concern.value as any);
                        return (
                          <Button
                            key={concern.value}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            onClick={() => toggleConcern(concern.value)}
                            className="h-auto py-4 flex flex-col items-center space-y-2"
                          >
                            <span className="text-2xl">{concern.icon}</span>
                            <span className="text-sm">{concern.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                    {form.formState.errors.concerns && (
                      <p className="text-sm text-destructive mt-2">
                        {form.formState.errors.concerns.message}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={form.watch("concerns").length === 0}
                  className="w-full btn-primary py-4 text-lg"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}

            {/* Step 3: Allergies */}
            {step === 3 && (
              <Card className="card-shadow border-0">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle>Any allergies or sensitivities?</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Help us avoid ingredients that might irritate your skin
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base font-medium">Known allergies</Label>
                    <div className="flex space-x-2 mt-2">
                      <Input
                        value={allergiesInput}
                        onChange={(e) => setAllergiesInput(e.target.value)}
                        placeholder="e.g., Fragrance, Retinol"
                        className="input-focus py-3"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAllergy())}
                      />
                      <Button
                        type="button"
                        onClick={addAllergy}
                        variant="outline"
                        className="touch-target"
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  {selectedAllergies.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Your allergies:</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedAllergies.map((allergy) => (
                          <Badge
                            key={allergy}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeAllergy(allergy)}
                          >
                            {allergy} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={onboardingMutation.isPending}
                      className="w-full btn-primary py-4 text-lg"
                    >
                      {onboardingMutation.isPending ? "Creating Profile..." : "Complete Setup"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}