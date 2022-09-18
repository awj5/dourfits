import { createContext } from 'react';

export interface Darcel {
  background: string;
  head: string;
  eye: string;
  hairAndHats: string;
  shoesAndLegs: string;
  bottoms: string;
  tops: string;
  bodyAccessories: string;
  arms: string;
  facialHair: string;
  mouth: string;
  headAccessories: string;
  glasses: string;
}

export const DefaultDarcel: Darcel = {
  background: "background/wardrobe.png",
  head: "head/regular.svg",
  eye: "eye/regular.svg",
  hairAndHats: "",
  shoesAndLegs: "shoes-and-legs/regular.svg",
  bottoms: "bottoms/underwear.svg",
  tops: "",
  bodyAccessories: "",
  arms: "arms/regular.svg",
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