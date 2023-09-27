export const allVariableTypes = ['color', 'dimension', 'border'] as const;

export type VariableType = (typeof allVariableTypes)[number];

export type CommonVariableInfo = {
  hideEditor?: boolean;
};

export type DimensionVariableInfo = CommonVariableInfo & {
  type: 'dimension';
  min: number;
  max: number;
  step: number;
};
export type ColorVariableInfo = CommonVariableInfo & {
  type: 'color';
};
export type BorderVariableInfo = CommonVariableInfo & {
  type: 'border';
  style?: boolean;
  width?: boolean;
  color?: boolean;
};

export type VariableInfoByType = {
  dimension: DimensionVariableInfo;
  color: ColorVariableInfo;
  border: BorderVariableInfo;
};

export type VariableInfo = VariableInfoByType[VariableType];

const variables: Record<string, VariableInfo> = {
  '--ag-grid-size': { type: 'dimension', min: 1, max: 50, step: 0.5 },
  '--ag-alpine-active-color': { type: 'color' },
  '--ag-background-color': { type: 'color' },
  '--ag-balham-active-color': { type: 'color' },
  '--ag-border-color': { type: 'color' },
  '--ag-chip-background-color': { type: 'color' },
  '--ag-column-hover-color': { type: 'color' },
  '--ag-disabled-foreground-color': { type: 'color' },
  '--ag-foreground-color': { type: 'color' },
  '--ag-header-column-resize-handle-color': { type: 'color' },
  '--ag-header-column-separator-color': { type: 'color' },
  '--ag-header-foreground-color': { type: 'color' },
  '--ag-input-border-color': { type: 'color' },
  '--ag-input-disabled-background-color': { type: 'color' },
  '--ag-input-disabled-border-color': { type: 'color' },
  '--ag-input-focus-border-color': { type: 'color' },
  '--ag-material-accent-color': { type: 'color' },
  '--ag-material-primary-color': { type: 'color' },
  '--ag-modal-overlay-background-color': { type: 'color' },
  '--ag-range-selection-background-color-2': { type: 'color', hideEditor: true },
  '--ag-range-selection-background-color-3': { type: 'color', hideEditor: true },
  '--ag-range-selection-background-color-4': { type: 'color', hideEditor: true },
  '--ag-range-selection-background-color': { type: 'color' },
  '--ag-range-selection-border-color': { type: 'color' },
  '--ag-range-selection-border-style': { type: 'border', style: true },
  '--ag-range-selection-highlight-color': { type: 'color' },
  '--ag-row-border-color': { type: 'color' },
  '--ag-row-hover-color': { type: 'color' },
  '--ag-secondary-foreground-color': { type: 'color' },
  '--ag-selected-row-background-color': { type: 'color' },
  '--ag-subheader-background-color': { type: 'color' },
  '--ag-subheader-toolbar-background-color': { type: 'color' },
  '--ag-border-radius': { type: 'dimension', min: 0, max: 50, step: 1 },
  '--ag-borders': { type: 'border', style: true, width: true },
  '--ag-borders-critical': { type: 'border', style: true, width: true },
  '--ag-borders-secondary': { type: 'border', style: true, width: true },
  '--ag-secondary-border-color': { type: 'color' },
};

export const allVariableNames = Object.keys(variables);

export const getVariableInfo = (variableName: string): VariableInfo | null =>
  variables[variableName] || null;

export const getVariableInfoOrThrow = (variableName: string) => {
  const info = getVariableInfo(variableName);
  if (info == null) {
    throw new Error(`Could not get info for variable "${variableName}"`);
  }
  return info;
};
