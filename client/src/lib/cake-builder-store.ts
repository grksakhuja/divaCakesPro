import { create } from 'zustand';
import { CakeConfig } from '@/types/cake';

interface CakeBuilderStore {
  currentStep: number;
  cakeConfig: CakeConfig;
  updateConfig: (updates: Partial<CakeConfig>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetBuilder: () => void;
}

const initialConfig: CakeConfig = {
  layers: 1,
  shape: "round",
  flavors: ["butter"],
  icingColor: "#87CEEB",
  icingType: "butter",
  decorations: [],
  messageFont: "classic",
  dietaryRestrictions: [],
  servings: 6,
  sixInchCakes: 1,
  eightInchCakes: 0,
  deliveryMethod: "pickup",
};

export const useCakeBuilder = create<CakeBuilderStore>((set, get) => ({
  currentStep: 1,
  cakeConfig: initialConfig,
  
  updateConfig: (updates) =>
    set((state) => ({
      cakeConfig: { ...state.cakeConfig, ...updates },
    })),
    
  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 9),
    })),
    
  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1),
    })),
    
  goToStep: (step) =>
    set(() => ({
      currentStep: Math.min(Math.max(step, 1), 9),
    })),
    
  resetBuilder: () =>
    set(() => ({
      currentStep: 1,
      cakeConfig: initialConfig,
    })),
}));
