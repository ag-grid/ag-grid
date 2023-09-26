import { CellRange, GridApi, GridOptions } from 'ag-grid-community';
import { indexBy } from './utils';

export type Feature = {
  name: string;
  displayName: string;
  variableNames: string[];
  commonVariablePrefix?: string;
  alwaysEnabled?: boolean;
  gridOptions?: Partial<GridOptions>;
  // put the grid into a state where this feature is visible so that it can be styled
  show?: (api: GridApi) => unknown;
  // get the state that should be restored after a grid rebuild to
  getState?: (api: GridApi) => unknown;
  restoreState?: (api: GridApi, state: unknown) => void;
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
    },
    // TODO implement this in order to make getState work
    // stateChangeEvents: [Events.EVENT_RANGE_SELECTION_CHANGED],
    getState: (api): CellRange[] | null => api.getCellRanges(),
    restoreState: (api, state) => {
      const savedSelections = state as CellRange[] | null;
      savedSelections?.forEach((range) => {
        const columnStart = range.columns[0]?.getId();
        const columnEnd = range.columns[range.columns.length - 1]?.getId();
        const rowStartIndex = range.startRow?.rowIndex;
        const rowEndIndex = range.endRow?.rowIndex;
        if (
          columnStart != null &&
          columnEnd != null &&
          rowStartIndex != null &&
          rowEndIndex != null
        ) {
          api.addCellRange({
            columnStart,
            columnEnd,
            rowStartIndex,
            rowEndIndex,
          });
        }
      });
    },
  },
];

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
