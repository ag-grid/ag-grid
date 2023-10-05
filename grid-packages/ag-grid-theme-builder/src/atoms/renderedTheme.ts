import { atom, useAtomValue } from 'jotai';
import { renderTheme, renderedThemeToCss } from 'model/render';
import { enabledFeaturesAtom } from './enabledFeatures';
import { parentThemeAtom } from './parentTheme';
import { valuesAtom } from './values';

const renderedThemeAtom = atom((get) => {
  const theme = get(parentThemeAtom);
  const features = get(enabledFeaturesAtom);
  const values = get(valuesAtom);

  return renderTheme({ theme, features, values });
});

export const useRenderedTheme = () => useAtomValue(renderedThemeAtom);

export const useRenderedVariable = (variableName: string) =>
  useRenderedTheme().values[variableName];

export const renderedThemeCssAtom = atom((get) => renderedThemeToCss(get(renderedThemeAtom)));

export const useRenderedThemeCss = () => useAtomValue(renderedThemeCssAtom);
