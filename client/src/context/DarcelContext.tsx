import { createContext } from 'react';

export interface Darcel {
  background: string;
  head: string;
  eye: string;
  hairAndHats?: string;
  shoes: string;
  bottoms?: string;
  tops: string;
  topAccessories?: string;
  facialHair?: string;
  mouth: string;
  headAccessories?: string;
  glasses?: string;
}

export const DefaultDarcel: Darcel = {
  background: "#F60",
  head: "head/regular",
  eye: "eye/regular",
  shoes: "shoes/regular",
  tops: "tops/crossed",
  mouth: "mouth/sad"
}

export type DarcelContextType = {
  darcel: Darcel;
  setDarcel: (darcel: Darcel) => void;
}

export const DarcelContext = createContext<DarcelContextType>({ darcel: DefaultDarcel, setDarcel: () => null });