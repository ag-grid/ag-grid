import { GridChartsModule } from '@ag-grid-enterprise/charts';
import { Feature } from '.';

export const integratedChartsFeature: Feature = {
  name: 'integratedCharts',
  displayName: 'Integrated Charts',
  commonVariablePrefix: '--ag-filter-tool-panel-',
  variableNames: [
    '--ag-minichart-selected-chart-color',
    '--ag-minichart-selected-page-color',
    '--ag-range-selection-chart-background-color',
    '--ag-range-selection-chart-category-background-color',
  ],
  gridOptions: {
    enableCharts: true,
  },
  defaultColDef: {
    filter: true,
  },
  modules: [GridChartsModule],
};
