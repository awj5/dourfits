import { createContext } from 'react';

export type XPContextType = {
  xp: number;
  setXP: (xp: number) => void;
}

export const XPContext = createContext<XPContextType>({ xp: 0, setXP: () => null });