import { CellRange, Events, GridApi, GridOptions } from 'ag-grid-community';
import { indexBy } from './utils';

export type Feature = {
  name: string;
  displayName: string;
  variableNames: string[];
  commonVariablePrefix?: string;
  alwaysEnabled?: boolean;
  gridOptions?: Partial<GridOptions>;
  // put the grid into a state where this feature is visible so that it can be styled
  show?: (api: GridApi) => void;
  // get the state that should be restored after a grid rebuild to
  getState?: (api: GridApi) => JSONValue;
  restoreState?: (api: GridApi, state: JSONValue) => void;
  // events on which to save and restore state
  stateChangeEvents?: string[];
};

export const allFeatures: Feature[] = [
  {
    name: 'basic',
    displayName: 'Basic configuration',
    alwaysEnabled: true,
    variableNames: [
      '--ag-grid-size',
      '--ag-alpine-active-color',
      '--ag-balham-active-color',
      '--ag-material-primary-color',
      '--ag-material-accent-color',
      '--ag-foreground-color',
      '--ag-secondary-foreground-color',
      '--ag-background-color',
      '--ag-border-color',
    ],
  },
  {
    name: 'range-selection',
    displayName: 'Range Selections',
    commonVariablePrefix: '--ag-range-selection-',
    variableNames: [
      '--ag-range-selection-border-color',
      '--ag-range-selection-border-style',
      '--ag-range-selection-background-color',
      '--ag-range-selection-background-color-2',
      '--ag-range-selection-background-color-3',
      '--ag-range-selection-background-color-4',
      '--ag-range-selection-highlight-color',
    ],
    gridOptions: {
      enableRangeSelection: true,
    },
    show: (api) => {
      const ranges = api.getCellRanges() || [];
      if (ranges.length > 1 || ranges.find(isMultiCellRange)) return;
      api.clearRangeSelection();
      api.addCellRange({
        columnStart: 'make',
        columnEnd: 'model',
        rowStartIndex: 0,
        rowEndIndex: 2,
      });
      api.addCellRange({
        columnStart: 'model',
        columnEnd: 'price',
        rowStartIndex: 1,
        rowEndIndex: 2,
      });
    },
    stateChangeEvents: [Events.EVENT_RANGE_SELECTION_CHANGED],
    getState: (api) => {
      const ranges = api.getCellRanges();
      if (!ranges) return null;
      return ranges.map((range) => ({
        columnStart: range.columns[0]?.getId(),
        columnEnd: range.columns[range.columns.length - 1]?.getId(),
        rowStartIndex: range.startRow?.rowIndex,
        rowEndIndex: range.endRow?.rowIndex,
      }));
    },
    restoreState: (api, state) => {
      if (!Array.isArray(state)) throw new Error('Expected state to be an array');
      state.forEach((range) => {
        if (!range || typeof range !== 'object' || Array.isArray(range))
          throw new Error(`Expected state item to be an object, got ${JSON.stringify(range)}`);
        const { columnStart, columnEnd, rowStartIndex, rowEndIndex } = range;
        if (
          typeof columnStart !== 'string' ||
          typeof columnEnd !== 'string' ||
          typeof rowStartIndex !== 'number' ||
          typeof rowEndIndex !== 'number'
        ) {
          throw new Error(`Incorrect range keys on state item: ${JSON.stringify(range)}`);
        }
        api.addCellRange({
          columnStart,
          columnEnd,
          rowStartIndex,
          rowEndIndex,
        });
      });
    },
  },
];

export type JSONPrimitive = string | number | boolean | null | undefined;

export interface JSONObject {
  [index: string]: JSONPrimitive | JSONObject | JSONArray;
}

export interface JSONArray extends Array<JSONPrimitive | JSONObject | JSONArray> {}

export type JSONValue = JSONPrimitive | JSONArray | JSONObject;

const isMultiCellRange = (r: CellRange) =>
  r.columns.length > 1 || Math.abs((r.startRow?.rowIndex || 0) - (r.endRow?.rowIndex || 0)) > 1;

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
