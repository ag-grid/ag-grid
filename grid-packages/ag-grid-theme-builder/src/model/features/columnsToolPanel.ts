import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';

import { Feature } from '.';

export const columnsToolPanelFeature: Feature = {
  name: 'columnsToolPanel',
  displayName: 'Columns Tool Panel',
  commonVariablePrefix: '--ag-column-select-',
  variableNames: [
    '--ag-column-select-indent-size',
    '--ag-control-panel-background-color',
    '--ag-widget-container-horizontal-padding',
    '--ag-widget-container-vertical-padding',
    '--ag-widget-horizontal-spacing',
    '--ag-widget-vertical-spacing',

    '--ag-borders-side-button',
    '--ag-side-bar-panel-width',
    '--ag-side-button-selected-background-color',
  ],
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
  modules: [ColumnsToolPanelModule],
};
