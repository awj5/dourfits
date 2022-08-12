import { createContext } from 'react';

export interface Darcel {
  background: string;
  head: string;
  eye: string;
  hairAndHats: string;
  shoes: string;
  bottoms: string;
  tops: string;
  topAccessories: string;
  facialHair: string;
  mouth: string;
  headAccessories: string;
  glasses: string;
}

export const DefaultDarcel: Darcel = {
  background: "#F60",
  head: "head/regular.svg",
  eye: "eye/regular.svg",
  hairAndHats: "",
  shoes: "shoes/regular.svg",
  bottoms: "",
  tops: "tops/nude-shrug.svg",
  topAccessories: "",
  facialHair: "",
  mouth: "mouth/sad.svg",
  headAccessories: "",
  glasses: ""
}

export type DarcelContextType = {
  darcel: Darcel;
  setDarcel: (darcel: Darcel) => void;
}

export const DarcelContext = createContext<DarcelContextType>({ darcel: DefaultDarcel, setDarcel: () => null });