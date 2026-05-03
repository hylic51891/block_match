import { create } from 'zustand';
import type { GameMode } from '@/types/challenge';

type Scene = 'home' | 'battle' | 'result';

interface UIStore {
  scene: Scene;
  debugOpen: boolean;
  currentMode: GameMode;
  navigateTo: (scene: Scene) => void;
  toggleDebug: () => void;
  setCurrentMode: (mode: GameMode) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  scene: 'home',
  debugOpen: false,
  currentMode: 'daily_challenge',

  navigateTo: (scene: Scene) => set({ scene }),

  toggleDebug: () => set((s) => ({ debugOpen: !s.debugOpen })),

  setCurrentMode: (mode: GameMode) => set({ currentMode: mode }),
}));
