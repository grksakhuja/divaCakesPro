import { cn } from "@/lib/utils";

interface ColorPaletteProps {
  colors: Array<{ id: string; name: string; hex: string }>;
  selectedColor: string;
  onColorSelect: (hex: string) => void;
  className?: string;
}

export default function ColorPalette({ 
  colors, 
  selectedColor, 
  onColorSelect, 
  className 
}: ColorPaletteProps) {
  return (
    <div className={cn("grid grid-cols-6 gap-3", className)}>
      {colors.map((color) => (
        <button
          key={color.id}
          onClick={() => onColorSelect(color.hex)}
          className={cn(
            "w-12 h-12 rounded-full border-4 shadow-lg hover:scale-110 transition-transform touch-target",
            selectedColor === color.hex
              ? "border-primary scale-110"
              : "border-white"
          )}
          style={{ backgroundColor: color.hex }}
          aria-label={`Select ${color.name} color`}
        />
      ))}
    </div>
  );
}
