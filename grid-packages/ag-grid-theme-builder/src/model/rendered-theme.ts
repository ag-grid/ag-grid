import { atom } from 'jotai';
import { Theme, defineTheme, installTheme } from '../ag-grid-community-themes';
import { allParamModels } from './ParamModel';
import { allPartModels } from './PartModel';

export const renderedThemeAtom = atom((get): Theme => {
  const paramValues = Object.fromEntries(
    allParamModels().map((param) => [param.property, get(param.valueAtom)]),
  );

  const themeParts = allPartModels()
    .filter((part) => get(part.enabledAtom))
    .map((part) => part.themePart);

  const theme = defineTheme(themeParts, paramValues);

  // TODO this line has an interesting effect - because environment.ts uses a
  // MutationObserver to monitor the element with the theme class on it,
  // classList.add causes the grid to re-measure row heights and resize itself
  // if necessary. This is exactly what we want. But it's a bit of a hack and
  // will stop working when we move to a theme grid option. Would be better to
  // introduce an API for it.
  document.body.classList.add('ag-theme-custom');

  installTheme(theme);

  return theme;
});
