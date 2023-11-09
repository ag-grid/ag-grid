import { ColDef, GridApi, GridOptions, Module, ModuleRegistry } from '@ag-grid-community/core';
import { ComponentType } from 'react';
import { indexBy } from '../utils';
import { advancedFilterFeature } from './advancedFilter';
import { bordersFeature } from './borders';
import { checkboxesFeature } from './checkboxes';
import { columnGroupsFeature } from './columnGroups';
import { columnHoverFeature } from './columnHover';
import { columnResizingFeature } from './columnResizing';
import { columnsToolPanelFeature } from './columnsToolPanel';
import { contextMenuFeature } from './contextMenu';
import { coreFeature } from './core';
import { filtersToolPanelFeature } from './filtersToolPanel';
import { gridBodyFeature } from './gridBody';
import { headerFeature } from './header';
import { iconsFeature } from './icons';
import { inputsFeature } from './inputs';
import { overlayFeature } from './overlay';
import { rangeSelectionFeature } from './rangeSelection';
import { rowDragFeature } from './rowDrag';
import { rowGroupingFeature } from './rowGrouping';
import { rowSelectionFeature } from './rowSelection';
import { toggleButtonsFeature } from './toggleButtons';

export type Feature = {
  readonly name: string;
  readonly displayName: string;
  readonly variableNames: ReadonlyArray<string>;
  readonly commonVariablePrefix?: string;
  readonly alwaysEnabled?: boolean;
  readonly gridOptions?: GridOptions;
  readonly defaultColDef?: ColDef;
  readonly columnDefs?: ColDef[];
  readonly addColumnGroups?: boolean;
  readonly previewComponent?: ComponentType;
  readonly modules?: ReadonlyArray<Module>;
  // put the grid into a state where this feature is visible so that it can be styled
  show?: (api: GridApi) => unknown;
  // undo `show` if necessary
  hide?: (api: GridApi) => unknown;
  // get the state that should be restored after a grid rebuild to
  getState?: (api: GridApi) => unknown;
  restoreState?: (api: GridApi, state: unknown) => void;
};

export const allFeatures: ReadonlyArray<Feature> = [
  advancedFilterFeature,
  bordersFeature,
  checkboxesFeature,
  columnGroupsFeature,
  columnHoverFeature,
  columnResizingFeature,
  columnsToolPanelFeature,
  contextMenuFeature,
  coreFeature,
  filtersToolPanelFeature,
  gridBodyFeature,
  headerFeature,
  iconsFeature,
  inputsFeature,
  overlayFeature,
  rangeSelectionFeature,
  rowDragFeature,
  rowGroupingFeature,
  rowSelectionFeature,
  toggleButtonsFeature,
];

const featuresByName = indexBy(allFeatures, 'name');

export const getFeature = (featureName: string): Feature | null =>
  featuresByName[featureName] || null;

export const getFeatureOrThrow = (featureName: string): Feature => {
  const feature = getFeature(featureName);
  if (feature == null) {
    throw new Error(`Invalid feature name "${featureName}"`);
  }
  return feature;
};

export const registerFeatureModules = () =>
  allFeatures.forEach((feature) => {
    if (feature.modules) {
      ModuleRegistry.registerModules([...feature.modules]);
    }
  });
