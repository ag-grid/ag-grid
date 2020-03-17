import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model'
import { InfiniteRowModelModule } from '@ag-grid-community/infinite-row-model'
import { CsvExportModule } from '@ag-grid-community/csv-export'
import { ModuleRegistry } from "@ag-grid-community/core";

ModuleRegistry.register(ClientSideRowModelModule);
ModuleRegistry.register(InfiniteRowModelModule);
ModuleRegistry.register(CsvExportModule);

export * from "@ag-grid-community/core";
