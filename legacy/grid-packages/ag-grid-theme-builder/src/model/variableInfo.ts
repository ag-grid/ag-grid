import { ValueType } from './values';

export type CommonVariableInfo = {
  specificToTheme?: string;
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

export type BorderStyleVariableInfo = CommonVariableInfo & {
  type: 'borderStyle';
};

export type DisplayVariableInfo = CommonVariableInfo & {
  type: 'display';
};

export type VariableInfoByType = {
  dimension: DimensionVariableInfo;
  color: ColorVariableInfo;
  border: BorderVariableInfo;
  borderStyle: BorderStyleVariableInfo;
  display: DisplayVariableInfo;
};

export type VariableInfo = VariableInfoByType[ValueType];

const colorVariables = [
  '--ag-active-color',
  '--ag-advanced-filter-join-pill-color',
  '--ag-advanced-filter-column-pill-color',
  '--ag-advanced-filter-option-pill-color',
  '--ag-advanced-filter-value-pill-color',
  '--ag-background-color',
  '--ag-border-color',
  '--ag-checkbox-background-color',
  '--ag-checkbox-checked-color',
  '--ag-checkbox-indeterminate-color',
  '--ag-checkbox-unchecked-color',
  '--ag-chip-background-color',
  '--ag-column-hover-color',
  '--ag-control-panel-background-color',
  '--ag-data-color',
  '--ag-disabled-foreground-color',
  '--ag-foreground-color',
  '--ag-header-background-color',
  '--ag-header-cell-hover-background-color',
  '--ag-header-cell-moving-background-color',
  '--ag-header-column-resize-handle-color',
  '--ag-header-column-separator-color',
  '--ag-header-foreground-color',
  '--ag-input-border-color-invalid',
  '--ag-input-border-color',
  '--ag-input-disabled-background-color',
  '--ag-input-disabled-border-color',
  '--ag-input-focus-border-color',
  '--ag-invalid-color',
  '--ag-minichart-selected-chart-color',
  '--ag-minichart-selected-page-color',
  '--ag-modal-overlay-background-color',
  '--ag-odd-row-background-color',
  '--ag-range-selection-background-color-2',
  '--ag-range-selection-background-color-3',
  '--ag-range-selection-background-color-4',
  '--ag-range-selection-background-color',
  '--ag-range-selection-border-color',
  '--ag-range-selection-chart-background-color',
  '--ag-range-selection-chart-category-background-color',
  '--ag-range-selection-highlight-color',
  '--ag-row-border-color',
  '--ag-row-hover-color',
  '--ag-secondary-border-color',
  '--ag-secondary-foreground-color',
  '--ag-selected-row-background-color',
  '--ag-selected-tab-underline-color',
  '--ag-side-button-selected-background-color',
  '--ag-subheader-background-color',
  '--ag-subheader-toolbar-background-color',
  '--ag-toggle-button-off-background-color',
  '--ag-toggle-button-off-border-color',
  '--ag-toggle-button-on-background-color',
  '--ag-toggle-button-on-border-color',
  '--ag-toggle-button-switch-background-color',
  '--ag-toggle-button-switch-border-color',
  '--ag-tooltip-background-color',
  '--ag-value-change-delta-down-color',
  '--ag-value-change-delta-up-color',
  '--ag-value-change-value-highlight-background-color',
];

const variables: Record<string, VariableInfo> = {
  '--ag-advanced-filter-builder-indent-size': { type: 'dimension', min: 0, max: 100, step: 1 },
  '--ag-border-radius': { type: 'dimension', min: 0, max: 100, step: 1 },
  '--ag-borders-critical': { type: 'border', style: true, width: true },
  '--ag-borders-input-invalid': { type: 'border', style: true, width: true },
  '--ag-borders-input': { type: 'border', style: true, width: true },
  '--ag-borders-secondary': { type: 'border', style: true, width: true },
  '--ag-borders-side-button': { type: 'border', style: true, width: true },
  '--ag-borders': { type: 'border', style: true, width: true },
  '--ag-card-radius': { type: 'dimension', min: 0, max: 100, step: 1 },
  // TODO shadow inputs
  // '--ag-card-shadow': { type: 'shadow' },
  '--ag-cell-horizontal-border': { type: 'border', style: true, color: true },
  '--ag-cell-horizontal-padding': { type: 'dimension', min: 0, max: 100, step: 1 },
  '--ag-cell-widget-spacing': { type: 'dimension', min: 0, max: 100, step: 1 },
  '--ag-checkbox-border-radius': { type: 'dimension', min: 0, max: 100, step: 1 },
  '--ag-column-select-indent-size': { type: 'dimension', min: 0, max: 100, step: 1 },
  '--ag-filter-tool-panel-group-indent': { type: 'dimension', min: 0, max: 100, step: 1 },
  // TODO font-family inputs
  // '--ag-font-family': { type: 'font-family' },
  '--ag-font-size': { type: 'dimension', min: 0, max: 100, step: 1 },
  '--ag-grid-size': { type: 'dimension', min: 1, max: 50, step: 0.5 },
  '--ag-header-column-resize-handle-display': { type: 'display' },
  '--ag-header-column-resize-handle-height': { type: 'dimension', min: 0, max: 100, step: 1 },
  '--ag-header-column-resize-handle-width': { type: 'dimension', min: 0, max: 100, step: 1 },
  '--ag-header-column-separator-display': { type: 'display' },
  '--ag-header-column-separator-height': { type: 'dimension', min: 0, max: 100, step: 1 },
  '--ag-header-column-separator-width': { type: 'dimension', min: 0, max: 100, step: 1 },
  '--ag-header-height': { type: 'dimension', min: 0, max: 100, step: 1 },
  // TODO icon-font-family inputs
  // '--ag-icon-font-family': { type: 'font-family', icon: true },
  '--ag-icon-size': { type: 'dimension', min: 0, max: 100, step: 1 },
  // '--ag-input-focus-box-shadow': { type: 'shadow' },
  '--ag-list-item-height': { type: 'dimension', min: 0, max: 100, step: 1 },
  '--ag-menu-min-width': { type: 'dimension', min: 0, max: 1000, step: 10 },
  // '--ag-popup-shadow': { type: 'shadow' },
  '--ag-range-selection-border-style': { type: 'border', style: true },
  '--ag-row-border-style': { type: 'border', style: true },
  '--ag-row-border-width': { type: 'dimension', min: 0, max: 100, step: 1 },
  '--ag-row-group-indent-size': { type: 'dimension', min: 0, max: 100, step: 1 },
  '--ag-row-height': { type: 'dimension', min: 0, max: 100, step: 1 },
  '--ag-selected-tab-underline-transition-speed': {
    type: 'dimension',
    min: 0,
    max: 10,
    step: 0.01,
  },
  '--ag-selected-tab-underline-width': { type: 'dimension', min: 0, max: 100, step: 1 },
  '--ag-set-filter-indent-size': { type: 'dimension', min: 0, max: 100, step: 1 },
  '--ag-side-bar-panel-width': { type: 'dimension', min: 0, max: 1000, step: 10 },
  '--ag-tab-min-width': { type: 'dimension', min: 0, max: 100, step: 1 },
  '--ag-toggle-button-border-width': { type: 'dimension', min: 0, max: 10, step: 0.5 },
  '--ag-toggle-button-height': { type: 'dimension', min: 0, max: 100, step: 1 },
  '--ag-toggle-button-width': { type: 'dimension', min: 0, max: 100, step: 1 },
  '--ag-widget-container-horizontal-padding': { type: 'dimension', min: 0, max: 100, step: 1 },
  '--ag-widget-container-vertical-padding': { type: 'dimension', min: 0, max: 100, step: 1 },
  '--ag-widget-horizontal-spacing': { type: 'dimension', min: 0, max: 100, step: 1 },
  '--ag-widget-vertical-spacing': { type: 'dimension', min: 0, max: 100, step: 1 },

  ...Object.fromEntries(colorVariables.map((variableName) => [variableName, { type: 'color' }])),

  '--ag-material-primary-color': { type: 'color', specificToTheme: 'ag-theme-material' },
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
