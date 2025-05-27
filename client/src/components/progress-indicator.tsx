import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCakeBuilder } from "@/lib/cake-builder-store";

const stepTitles = [
  "🍰 Welcome",
  "🧁 Build Layers", 
  "🍰 Choose Flavors",
  "🎨 Icing & Decorations",
  "💌 Add Message",
  "🌱 Dietary Options",
  "📏 Size & Servings",
  "🎉 Contact Info",
  "📋 Order Summary",
];

export default function ProgressIndicator() {
  const { currentStep, prevStep, resetBuilder } = useCakeBuilder();
  const progress = (currentStep / 9) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevStep}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 ${
              currentStep === 1 ? "invisible" : "visible"
            }`}
          >
            <ArrowLeft className="h-5 w-5 text-neutral-500" />
          </Button>
          
          <div className="text-sm font-medium text-neutral-500">
            {stepTitles[currentStep - 1]}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetBuilder}
              className="p-2 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
              title="Reset to start"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <div className="text-sm text-neutral-500">
              {currentStep} of 9
            </div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="cake-gradient h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
