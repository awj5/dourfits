import { createContext } from 'react';

export interface Overlay {
  visible: boolean;
  title?: string;
  message?: string;
}

export type OverlayContextType = {
  overlay: Overlay;
  setOverlay: (overlay: Overlay) => void;
}

export const OverlayContext = createContext<OverlayContextType>({ overlay: { visible: false }, setOverlay: () => null });