import { Feature } from '.';

export const columnResizingFeature: Feature = {
  name: 'columnResizing',
  displayName: 'Column Resizing',
  commonVariablePrefix: '--ag-header-column-',
  variableNames: [
    '--ag-header-column-resize-handle-color',
    '--ag-header-column-resize-handle-display',
    '--ag-header-column-resize-handle-height',
    '--ag-header-column-resize-handle-width',
  ],
  defaultColDef: {
    resizable: true,
  },
};
