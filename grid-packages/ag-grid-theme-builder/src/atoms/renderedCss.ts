import { atom, useAtomValue } from 'jotai';
import { renderCss } from 'model/render';
import { parentThemeAtom } from './parentTheme';
import { valuesAtom } from './values';

const renderedCss = atom((get) => {
  const theme = get(parentThemeAtom);
  const values = get(valuesAtom);

  return renderCss({ themeName: theme.name, values });
});

export const useRenderedCss = () => useAtomValue(renderedCss);
