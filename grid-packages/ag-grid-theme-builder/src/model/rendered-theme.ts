import { atom } from 'jotai';
import {
  Theme,
  borders,
  colors,
  core,
  defineTheme,
  installTheme,
  quartzIcons,
} from '../ag-grid-community-themes';
import { allParamModels } from './ParamModel';

export const renderedThemeAtom = atom((get): Theme => {
  const paramValues = Object.fromEntries(
    allParamModels().map((param) => [param.property, get(param.valueAtom)]),
  );

  console.log('rendering theme');

  const theme = defineTheme('custom', [core, borders, colors, quartzIcons], paramValues);

  document.body.className = 'ag-theme-custom';

  installTheme(theme);

  return theme;
});
