import { create } from 'zustand';
import { DIMENSIONS, type Dimension } from '../contract/schema';

interface ExplorerState {
  dimension: Dimension;
  setDimension: (d: Dimension) => void;
}

export const useExplorer = create<ExplorerState>((set) => ({
  dimension: DIMENSIONS[0],
  setDimension: (dimension) => set({ dimension }),
}));
