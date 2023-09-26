import { RenderedTheme } from 'model/render';
import { createContext, useContext } from 'react';

const RenderedThemeContext = createContext<RenderedTheme | null>(null);

export const RenderedThemeProvider = RenderedThemeContext.Provider;

export const useRenderedTheme = () => {
  const valueFromContext = useContext(RenderedThemeContext);
  if (valueFromContext == null) {
    throw new Error(`useRenderedTheme requires a RenderedThemeProvider ancestor`);
  }
  return valueFromContext;
};
export const useRenderedVariable = (variableName: string) =>
  useRenderedTheme().values[variableName];
