import { Feature } from '.';

export const rowGroupingFeature: Feature = {
  name: 'row-grouping',
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
};
