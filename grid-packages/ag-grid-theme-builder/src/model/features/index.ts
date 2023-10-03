import { ColDef, GridApi, GridOptions, Module, ModuleRegistry } from '@ag-grid-community/core';
import { indexBy } from '../utils';
import { bordersFeature } from './borders';
import { columnResizingFeature } from './columnResizing';
import { columnsToolPanelFeature } from './columnsToolPanel';
import { coreFeature } from './core';
import { filtersToolPanelFeature } from './filtersToolPanel';
import { gridBodyFeature } from './gridBody';
import { headerFeature } from './header';
import { overlayFeature } from './overlay';
import { rangeSelectionFeature } from './rangeSelection';
import { rowGroupingFeature } from './rowGrouping';
import { rowSelectionFeature } from './rowSelection';

export type Feature = {
  name: string;
  displayName: string;
  variableNames: string[];
  commonVariablePrefix?: string;
  alwaysEnabled?: boolean;
  gridOptions?: GridOptions;
  defaultColDef?: ColDef;
  columnDefs?: ColDef[];
  // put the grid into a state where this feature is visible so that it can be styled
  show?: (api: GridApi) => unknown;
  // undo `show` if necessary
  hide?: (api: GridApi) => unknown;
  // get the state that should be restored after a grid rebuild to
  getState?: (api: GridApi) => unknown;
  restoreState?: (api: GridApi, state: unknown) => void;
  modules?: Module[];
};

export const allFeatures: Feature[] = [
  coreFeature,
  rangeSelectionFeature,
  bordersFeature,
  gridBodyFeature,
  headerFeature,
  columnResizingFeature,
  columnsToolPanelFeature,
  filtersToolPanelFeature,
  rowGroupingFeature,
  overlayFeature,
  rowSelectionFeature,
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
  allFeatures.forEach((feature) => ModuleRegistry.registerModules(feature.modules || []));
