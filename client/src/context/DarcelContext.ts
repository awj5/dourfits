import { createContext } from 'react';

export interface Darcel {
  background: string;
  head: string;
  eye: string;
  hairAndHats: string;
  shoesAndLegs: string;
  bottoms: string;
  tops: string;
  arms: string;
  bodyAccessories: string;
  facialHair: string;
  mouth: string;
  headAccessories: string;
  glasses: string;
}

export const DefaultDarcel: Darcel = {
  background: "#999",
  head: "head/regular.svg",
  eye: "eye/regular.svg",
  hairAndHats: "",
  shoesAndLegs: "shoes-and-legs/nude-undies.svg",
  bottoms: "",
  tops: "",
  arms: "arms/shrug.svg",
  bodyAccessories: "",
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