import { AdvancedFilterModel } from '@ag-grid-community/core';
import { AdvancedFilterModule } from '@ag-grid-enterprise/advanced-filter';
import { Feature } from '.';

export const advancedFilterFeature: Feature = {
  name: 'advancedFilter',
  displayName: 'Advanced Filter Builder',
  variableNames: [
    '--ag-advanced-filter-join-pill-color',
    '--ag-advanced-filter-column-pill-color',
    '--ag-advanced-filter-option-pill-color',
    '--ag-advanced-filter-value-pill-color',
    '--ag-advanced-filter-builder-indent-size',
  ],
  commonVariablePrefix: '--ag-advanced-filter-',
  gridOptions: {
    enableAdvancedFilter: true,
  },
  defaultColDef: {
    filter: true,
  },
  getState(api) {
    return api.getAdvancedFilterModel();
  },
  restoreState(api, state) {
    if (state && typeof state === 'object') {
      api.setAdvancedFilterModel(state as AdvancedFilterModel);
    }
  },
  show(api) {
    const model = api.getAdvancedFilterModel();
    if (!model) {
      api.setAdvancedFilterModel(defaultModel);
    }
    api.showAdvancedFilterBuilder();
  },
  modules: [AdvancedFilterModule],
};

const defaultModel: AdvancedFilterModel = {
  filterType: 'join',
  type: 'AND',
  conditions: [
    {
      filterType: 'text',
      colId: 'make',
      type: 'notContains',
      filter: 'BMW',
    },
    {
      filterType: 'number',
      colId: 'year',
      type: 'greaterThan',
      filter: 2001,
    },
  ],
};
