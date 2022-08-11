import { createContext } from 'react';

export interface Overlay {
  visible: boolean;
  title: string;
  message: string;
}

export const DefaultOverlay: Overlay = {
  visible: false,
  title: "",
  message: ""
}

export type OverlayContextType = {
  overlay: Overlay;
  setOverlay: (overlay: Overlay) => void;
}

export const OverlayContext = createContext<OverlayContextType>({ overlay: DefaultOverlay, setOverlay: () => null });