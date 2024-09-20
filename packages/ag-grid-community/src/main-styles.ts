/*
 * Used for umd bundles with styles
 */
import { ClientSideRowModelModule } from './clientSideRowModelModule';
import { CommunityFeaturesModule, ModuleRegistry } from './main';
import { CsvExportModule } from './csvExportModule';
import { InfiniteRowModelModule } from './infiniteRowModelModule';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine-no-font.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import '@ag-grid-community/styles/ag-theme-balham-no-font.css';
import '@ag-grid-community/styles/ag-theme-balham.css';
import '@ag-grid-community/styles/ag-theme-material-no-font.css';
import '@ag-grid-community/styles/ag-theme-material.css';
import '@ag-grid-community/styles/ag-theme-quartz-no-font.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import '@ag-grid-community/styles/agGridAlpineFont.css';
import '@ag-grid-community/styles/agGridBalhamFont.css';
import '@ag-grid-community/styles/agGridClassicFont.css';
import '@ag-grid-community/styles/agGridMaterialFont.css';
import '@ag-grid-community/styles/agGridQuartzFont.css';

ModuleRegistry.__registerModules(
    [CommunityFeaturesModule, ClientSideRowModelModule, InfiniteRowModelModule, CsvExportModule],
    false,
    undefined
);

// export * from '@ag-grid-community/core';
// export * from '@ag-grid-community/client-side-row-model';
// export * from '@ag-grid-community/csv-export';
// export * from '@ag-grid-community/infinite-row-model';
// export * from '@ag-grid-community/theming';
