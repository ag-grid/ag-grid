import { GridApi, GridOptions, Module } from '@ag-grid-community/core';
import { indexBy } from '../utils';
import { bordersFeature } from './borders';
import { coreFeature } from './core';
import { gridBodyFeature } from './gridBody';
import { headerFeature } from './header';
import { rangeSelectionFeature } from './rangeSelection';

export type Feature = {
  name: string;
  displayName: string;
  variableNames: string[];
  suppressEditorFor?: Set<string>;
  commonVariablePrefix?: string;
  alwaysEnabled?: boolean;
  gridOptions?: Partial<GridOptions>;
  // put the grid into a state where this feature is visible so that it can be styled
  show?: (api: GridApi) => unknown;
  // get the state that should be restored after a grid rebuild to
  getState?: (api: GridApi) => unknown;
  restoreState?: (api: GridApi, state: unknown) => void;
  // events on which to save and restore state
  stateChangeEvents?: string[];
  modules?: Module[];
};

export const allFeatures: Feature[] = [
  coreFeature,
  rangeSelectionFeature,
  bordersFeature,
  gridBodyFeature,
  headerFeature
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
