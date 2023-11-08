import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { Feature } from '.';

export const rowDragFeature: Feature = {
  name: 'rowDrag',
  displayName: 'Row Drag',
  commonVariablePrefix: '--ag-row-group-',
  variableNames: ['--ag-row-group-indent-size'],
  columnDefs: [
    {
      rowDrag: true,
    },
  ],
  modules: [RowGroupingModule],
};
