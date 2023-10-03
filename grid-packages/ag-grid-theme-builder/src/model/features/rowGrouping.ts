import { Feature } from '.';

export const rowGroupingFeature: Feature = {
  name: 'row-grouping',
  displayName: 'Row Grouping',
  commonVariablePrefix: '--ag-header-column-',
  variableNames: ['--ag-row-group-indent-size'],
  defaultColDef: {
    resizable: true,
  },
};
