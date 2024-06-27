/*
 * Used for umd bundles without styles, as well as cjs/esm packaging
 */
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { InfiniteRowModelModule } from '@ag-grid-community/infinite-row-model';

ModuleRegistry.__registerModules(
    [CommunityFeaturesModule, ClientSideRowModelModule, InfiniteRowModelModule, CsvExportModule],
    false,
    undefined
);

export * from '@ag-grid-community/core';
export * from '@ag-grid-community/client-side-row-model';
export * from '@ag-grid-community/csv-export';
export * from '@ag-grid-community/infinite-row-model';
