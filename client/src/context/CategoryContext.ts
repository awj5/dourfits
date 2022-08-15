import { createContext } from 'react';

export type CategoryContextType = {
  category: string;
  setCategory: (category: string) => void;
}

export const CategoryContext = createContext<CategoryContextType>({ category: 'categories', setCategory: () => null });