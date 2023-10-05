import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { Feature } from '.';

export const coreFeature: Feature = {
  name: 'core',
  displayName: 'Basic configuration',
  alwaysEnabled: true,
  variableNames: [
    '--ag-grid-size',
    '--ag-alpine-active-color',
    '--ag-balham-active-color',
    '--ag-material-primary-color',
    '--ag-material-accent-color',
    '--ag-foreground-color',
    '--ag-secondary-foreground-color',
    '--ag-background-color',
    '--ag-border-color',
  ],
  modules: [ClientSideRowModelModule],
};
