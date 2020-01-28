// for js examples that just require community functionality (landing pages, vanilla community examples etc)

const  ModuleRegistry = require("../../../../../community-modules/core/src/ts/main").ModuleRegistry;
export * from "../../../../../community-modules/core/src/ts/main";
export * from "../../../../../charts-packages/ag-charts-community/src/main";

/* MODULES - Don't delete this line */
const ClientSideRowModelModule = require("../../../../../community-modules/client-side-row-model/src/clientSideRowModelModule").ClientSideRowModelModule;
const CsvExportModule = require("../../../../../community-modules/csv-export/src/csvExportModule").CsvExportModule;
const InfiniteRowModelModule = require("../../../../../community-modules/infinite-row-model/src/infiniteRowModelModule").InfiniteRowModelModule;
        
ModuleRegistry.register(ClientSideRowModelModule);
ModuleRegistry.register(CsvExportModule);
ModuleRegistry.register(InfiniteRowModelModule);
