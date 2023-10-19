import { Feature } from '.';

export const rowSelectionFeature: Feature = {
  name: 'rowSelection',
  displayName: 'Row Selection',
  variableNames: ['--ag-selected-row-background-color'],
  gridOptions: {
    rowSelection: 'multiple',
    autoGroupColumnDef: {
      headerName: 'Group',
      field: 'name',
      headerCheckboxSelection: true,
      cellRendererParams: {
        checkbox: true,
      },
    },
  },
  columnDefs: [
    {
      checkboxSelection: (params) => {
        // we put checkbox on the name if we are not doing grouping
        return params.api.getRowGroupColumns().length === 0;
      },
      headerCheckboxSelection: (params) => {
        // we put checkbox on the name if we are not doing grouping
        return params.api.getRowGroupColumns().length === 0;
      },
    },
  ],
  getState(api) {
    const expanded: boolean[] = [];
    api.forEachNode((node, i) => (expanded[i] = !!node.isSelected()));
    return expanded;
  },
  restoreState(api, state) {
    if (!Array.isArray(state)) return;
    api.forEachNode((node, i) => node.setSelected(!!state[i]));
  },
  show(api) {
    const selectedNodes = api.getSelectedNodes();
    if (selectedNodes.length === 0) {
      api.forEachNode((node, i) => {
        if (i === 0 || i === 1 || i === 4) {
          node.setSelected(true);
        }
      });
    } else {
      api.ensureNodeVisible(selectedNodes[0]);
    }
  },
};
