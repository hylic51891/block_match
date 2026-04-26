import { create } from 'zustand';

type Scene = 'home' | 'battle' | 'result';

interface UIStore {
  scene: Scene;
  debugOpen: boolean;
  selectedLevelId: string | null;
  navigateTo: (scene: Scene) => void;
  toggleDebug: () => void;
  setSelectedLevelId: (id: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  scene: 'home',
  debugOpen: false,
  selectedLevelId: null,

  navigateTo: (scene: Scene) => set({ scene }),

  toggleDebug: () => set((s) => ({ debugOpen: !s.debugOpen })),

  setSelectedLevelId: (id: string | null) => set({ selectedLevelId: id }),
}));
