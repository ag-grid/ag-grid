import { indexBy } from './utils';

export type Theme = {
  name: string;
  extends: Theme | null;
  colorBlends: ColorBlend[];
};

export const baseTheme: Theme = {
  name: 'ag-theme-base',
  extends: null,
  colorBlends: [
    {
      destination: '--ag-disabled-foreground-color',
      source: '--ag-foreground-color',
      alpha: 0.5,
    },
    {
      destination: '--ag-modal-overlay-background-color',
      source: '--ag-background-color',
      alpha: 0.66,
    },
    {
      destination: '--ag-range-selection-background-color',
      source: '--ag-range-selection-border-color',
      alpha: 0.2,
    },
    {
      destination: '--ag-range-selection-background-color-2',
      source: '--ag-range-selection-background-color',
      selfOverlay: 2,
    },
    {
      destination: '--ag-range-selection-background-color-3',
      source: '--ag-range-selection-background-color',
      selfOverlay: 3,
    },
    {
      destination: '--ag-range-selection-background-color-4',
      source: '--ag-range-selection-background-color',
      selfOverlay: 4,
    },
    {
      destination: '--ag-border-color',
      source: '--ag-foreground-color',
      alpha: 0.25,
    },
    {
      destination: '--ag-header-column-separator-color',
      source: '--ag-border-color',
      alpha: 0.5,
    },
    {
      destination: '--ag-header-column-resize-handle-color',
      source: '--ag-border-color',
      alpha: 0.5,
    },
    {
      destination: '--ag-input-disabled-border-color',
      source: '--ag-input-border-color',
      alpha: 0.3,
    },
  ],
};

export const alpineTheme: Theme = {
  name: 'ag-theme-alpine',
  extends: baseTheme,
  colorBlends: [
    // TODO The alpha and copy-only color blends can all be removed once AG-9445
    // (css color blending) is implemented
    {
      destination: '--ag-checkbox-background-color',
      source: '--ag-background-color',
    },
    {
      destination: '--ag-checkbox-checked-color',
      source: '--ag-alpine-active-color',
    },
    {
      destination: '--ag-range-selection-border-color',
      source: '--ag-alpine-active-color',
    },
    {
      destination: '--ag-secondary-foreground-color',
      source: '--ag-foreground-color',
    },
    {
      destination: '--ag-input-border-color',
      source: '--ag-border-color',
    },
    {
      destination: '--ag-input-border-color-invalid',
      source: '--ag-invalid-color',
    },
    {
      destination: '--ag-input-focus-box-shadow',
      source: '--ag-input-focus-border-color',
    },
    {
      destination: '--ag-subheader-toolbar-background-color',
      source: '--ag-subheader-background-color',
      alpha: 0.5,
    },
    {
      destination: '--ag-selected-row-background-color',
      source: '--ag-alpine-active-color',
      alpha: 0.1,
    },
    {
      destination: '--ag-row-hover-color',
      source: '--ag-alpine-active-color',
      alpha: 0.1,
    },
    {
      destination: '--ag-column-hover-color',
      source: '--ag-alpine-active-color',
      alpha: 0.1,
    },
    {
      destination: '--ag-chip-background-color',
      source: '--ag-foreground-color',
      alpha: 0.07,
    },
    {
      destination: '--ag-input-disabled-background-color',
      source: '--ag-border-color',
      alpha: 0.15,
    },
    {
      destination: '--ag-input-disabled-border-color',
      source: '--ag-border-color',
      alpha: 0.3,
    },
    {
      destination: '--ag-disabled-foreground-color',
      source: '--ag-foreground-color',
      alpha: 0.5,
    },
    {
      destination: '--ag-input-focus-border-color',
      source: '--ag-alpine-active-color',
      alpha: 0.4,
    },
  ],
};

export const alpineDarkTheme: Theme = {
  name: 'ag-theme-alpine-dark',
  extends: alpineTheme,
  colorBlends: [],
};

export const balhamTheme: Theme = {
  name: 'ag-theme-balham',
  extends: baseTheme,
  colorBlends: [
    {
      destination: '--ag-secondary-foreground-color',
      source: '--ag-foreground-color',
      alpha: 0.54,
    },
    {
      destination: '--ag-disabled-foreground-color',
      source: '--ag-foreground-color',
      alpha: 0.38,
    },
    {
      destination: '--ag-subheader-toolbar-background-color',
      source: '--ag-subheader-background-color',
      alpha: 0.5,
    },
    {
      destination: '--ag-row-border-color',
      source: '--ag-border-color',
      alpha: 0.58,
    },
    {
      destination: '--ag-chip-background-color',
      source: '--ag-foreground-color',
      alpha: 0.1,
    },
    {
      destination: '--ag-selected-row-background-color',
      source: '--ag-balham-active-color',
      alpha: 0.28,
    },
    {
      destination: '--ag-header-column-separator-color',
      source: '--ag-border-color',
      alpha: 0.5,
    },
  ],
};

export const balhamDarkTheme: Theme = {
  name: 'ag-theme-balham-dark',
  extends: balhamTheme,
  colorBlends: [
    {
      destination: '--ag-disabled-foreground-color',
      source: '--ag-foreground-color',
      alpha: 0.38,
    },
    {
      destination: '--ag-header-foreground-color',
      source: '--ag-foreground-color',
      alpha: 0.64,
    },
  ],
};

export const materialTheme: Theme = {
  name: 'ag-theme-material',
  extends: baseTheme,
  colorBlends: [],
};

export const allThemes: Theme[] = [
  baseTheme,
  alpineTheme,
  alpineDarkTheme,
  balhamTheme,
  balhamDarkTheme,
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

export const getThemeChain = (theme: Theme): Theme[] => {
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
  selfOverlay?: number;
};
