import { Feature } from '.';

export const columnHoverFeature: Feature = {
  name: 'columnHover',
  displayName: 'Column Hover',
  commonVariablePrefix: '--ag-column-hover-',
  variableNames: ['--ag-column-hover-color'],
  gridOptions: {
    columnHoverHighlight: true,
  },
};
