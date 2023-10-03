import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { Feature } from '.';

export const columnsToolPanelFeature: Feature = {
  name: 'columns-tool-panel',
  displayName: 'Columns Tool Panel',
  commonVariablePrefix: '--ag-column-select-',
  variableNames: ['--ag-column-select-indent-size', '--ag-control-panel-background-color'],
  gridOptions: {
    sideBar: ['columns'],
  },
  show: (api) => {
    api.openToolPanel('columns');
  },
  getState: (api) => api.getOpenedToolPanel(),
  restoreState: (api, state) => {
    if (typeof state !== 'string') return;
    api.openToolPanel(state);
  },
  modules: [ColumnsToolPanelModule, RowGroupingModule],
};
