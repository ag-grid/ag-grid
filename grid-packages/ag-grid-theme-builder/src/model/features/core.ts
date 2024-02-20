import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { Feature } from '.';

export const coreFeature: Feature = {
  name: 'core',
  displayName: 'Basic configuration',
  alwaysEnabled: true,
  variableNames: [
    '--ag-grid-size',
    '--ag-font-size',
    '--ag-active-color',
    '--ag-material-primary-color',
    '--ag-foreground-color',
    '--ag-secondary-foreground-color',
    '--ag-background-color',
    '--ag-border-color',
  ],
  modules: [ClientSideRowModelModule, SetFilterModule],
};
