import { useMemo } from "react";
import { motion } from "framer-motion";
import { useCakeBuilder } from "@/lib/cake-builder-store";
import fathersDayCakeImage from "@/assets/cakes/fathers-day-cake.svg";

export default function CakePreview() {
  const { cakeConfig } = useCakeBuilder();
  const { layers, shape, icingColor, decorations, message, template } = cakeConfig;

  // Check if we should show the Father's Day template image
  const showFathersDayImage = template === "fathers-day" || template === "999" || template === 999;

  // Generate cake description for custom builds
  const getCakeDescription = () => {
    if (showFathersDayImage) return "Father's Day Special Cake";
    
    const layerText = layers === 1 ? "Single Layer" : layers === 2 ? "Double Layer" : "Triple Layer";
    const shapeText = shape.charAt(0).toUpperCase() + shape.slice(1);
    return `${layerText} ${shapeText} Cake`;
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-lg">
      <h3 className="font-semibold mb-3 text-center text-sm">{getCakeDescription()}</h3>
      
      <div className="flex flex-col items-center justify-center h-44 bg-gradient-to-b from-sky-50 to-blue-100 rounded-lg relative overflow-hidden">
        
        {/* Show Father's Day cake image or cake details */}
        {showFathersDayImage ? (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex flex-col items-center"
          >
            <img 
              src={fathersDayCakeImage} 
              alt="Father's Day Special Cake" 
              className="w-32 h-32 object-contain filter drop-shadow-lg"
            />
            <div className="mt-2 text-center">
              <p className="text-xs text-blue-600 font-semibold">1 Layer • Butter Cake</p>
              <p className="text-xs text-gray-600">Blue Icing • 6 Servings</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="text-center space-y-4"
          >
            {/* Cake Summary Icon */}
            <div className="text-6xl">🎂</div>
            
            {/* Cake Details */}
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-4 text-sm">
                <span className="bg-white/80 px-2 py-1 rounded-full text-gray-700">
                  {layers} Layer{layers > 1 ? 's' : ''}
                </span>
                <span className="bg-white/80 px-2 py-1 rounded-full text-gray-700 capitalize">
                  {shape}
                </span>
              </div>
              
              {/* Icing Color Indicator */}
              <div className="flex items-center justify-center space-x-2">
                <span className="text-xs text-gray-600">Icing:</span>
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: icingColor }}
                />
              </div>
              
              {/* Decorations */}
              {decorations.length > 0 && (
                <div className="flex justify-center space-x-1">
                  {decorations.map(decoration => (
                    <span key={decoration} className="text-xs bg-white/80 px-2 py-1 rounded-full text-gray-600">
                      {decoration === "happy-birthday" ? "🎂" : 
                       decoration === "flowers" ? "🌸" :
                       decoration === "fruit" ? "🍓" :
                       decoration === "sprinkles" ? "✨" :
                       decoration === "gold" ? "⭐" : decoration}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Message */}
              {message && (
                <div className="bg-white/90 px-3 py-1 rounded-full text-xs text-gray-700 font-medium">
                  "{message}"
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}