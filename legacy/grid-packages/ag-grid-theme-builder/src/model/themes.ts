import { indexBy } from './utils';

export type Theme = {
  readonly name: string;
  readonly extends: Theme | null;
  readonly colorSchemes: string[];
};

export const baseTheme: Theme = {
  name: 'ag-theme-base',
  extends: null,
  colorSchemes: ['light'],
};

export const quartzTheme: Theme = {
  name: 'ag-theme-quartz',
  extends: baseTheme,
  colorSchemes: ['light', 'dark', 'auto'],
};

export const alpineTheme: Theme = {
  name: 'ag-theme-alpine',
  extends: baseTheme,
  colorSchemes: ['light', 'dark', 'auto'],
};

export const balhamTheme: Theme = {
  name: 'ag-theme-balham',
  extends: baseTheme,
  colorSchemes: ['light', 'dark', 'auto'],
};

export const materialTheme: Theme = {
  name: 'ag-theme-material',
  extends: baseTheme,
  colorSchemes: ['light'],
};

export const allThemes: ReadonlyArray<Theme> = [
  baseTheme,
  quartzTheme,
  alpineTheme,
  balhamTheme,
  materialTheme,
];

const themesByName = indexBy(allThemes, 'name');

export const getTheme = (themeName: string): Theme | null => themesByName[themeName] || null;

export const getThemeOrThrow = (themeName: string) => {
  const theme = getTheme(themeName);
  if (theme == null) {
    throw new Error(`Invalid theme name "${themeName}"`);
  }
  return theme;
};

export const getThemeChain = (theme: Theme): ReadonlyArray<Theme> => {
  const result = [theme];
  let parent: Theme | null = theme.extends;
  while (parent) {
    result.push(parent);
    parent = parent.extends;
  }
  return result;
};

export type ColorBlend = {
  destination: string;
  source: string;
  alpha?: number;
};
