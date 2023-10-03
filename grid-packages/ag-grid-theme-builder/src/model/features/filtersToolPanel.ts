import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { Feature } from '.';

export const filtersToolPanelFeature: Feature = {
  name: 'filters-tool-panel',
  displayName: 'Filters Tool Panel',
  commonVariablePrefix: '--ag-filter-tool-panel-',
  variableNames: ['--ag-filter-tool-panel-group-indent', '--ag-control-panel-background-color'],
  gridOptions: {
    sideBar: ['filters'],
  },
  show: (api) => {
    api.openToolPanel('filters');
  },
  getState: (api) => api.getOpenedToolPanel(),
  restoreState: (api, state) => {
    if (typeof state !== 'string') return;
    api.openToolPanel(state);
  },
  modules: [FiltersToolPanelModule],
};
