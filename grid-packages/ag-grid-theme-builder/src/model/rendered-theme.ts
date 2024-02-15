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

  const theme = defineTheme('custom', themeParts, paramValues);

  document.body.classList.add('ag-theme-custom');

  installTheme(theme);

  return theme;
});
