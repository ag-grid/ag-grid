import {ModuleRegistry} from '@ag-grid-community/core';
import {ClientSideRowModelModule} from '@ag-grid-community/client-side-row-model'
import {InfiniteRowModelModule} from '@ag-grid-community/infinite-row-model'
import {CsvExportModule} from '@ag-grid-community/csv-export'
import '@ag-grid-community/styles/ag-grid-no-native-widgets.css';
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

ModuleRegistry.registerModules([ClientSideRowModelModule, InfiniteRowModelModule, CsvExportModule])

export * from "@ag-grid-community/client-side-row-model";
export * from "@ag-grid-community/csv-export";
export * from "@ag-grid-community/infinite-row-model";
export * from "@ag-grid-community/core";

