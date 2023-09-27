import { CellRange, Events } from 'ag-grid-community';
import { Feature } from '.';

export const rangeSelectionFeature: Feature = {
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
};

const isMultiCellRange = (r: CellRange) =>
  r.columns.length > 1 || Math.abs((r.startRow?.rowIndex || 0) - (r.endRow?.rowIndex || 0)) > 1;
