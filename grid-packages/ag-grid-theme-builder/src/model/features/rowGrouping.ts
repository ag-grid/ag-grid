import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { Feature } from '.';

export const rowGroupingFeature: Feature = {
  name: 'rowGrouping',
  displayName: 'Row Grouping',
  commonVariablePrefix: '--ag-row-group-',
  variableNames: ['--ag-row-group-indent-size'],
  columnDefs: [
    {
      rowGroup: true,
    },
    {
      rowGroup: true,
    },
  ],
  gridOptions: {
    groupDefaultExpanded: 2,
    rowGroupPanelShow: 'always',
  },
  getState(api) {
    const expanded: boolean[] = [];
    api.forEachNode((node, i) => (expanded[i] = node.expanded));
    return expanded;
  },
  restoreState(api, state) {
    if (!Array.isArray(state)) return;
    api.forEachNode((node, i) => node.setExpanded(!!state[i]));
  },
  modules: [RowGroupingModule],
};
