// for js examples that just require community functionality (landing pages, vanilla community examples etc)

const  ModuleRegistry = require("../../../../../community-modules/grid-core/src/ts/main").ModuleRegistry;
export * from "../../../../../community-modules/grid-core/src/ts/main";

/* MODULES - Don't delete this line */
const ClientSideRowModelModule = require("../../../../../community-modules/grid-client-side-row-model/src/clientSideRowModelModule").ClientSideRowModelModule;
const CsvExportModule = require("../../../../../community-modules/grid-csv-export/src/csvExportModule").CsvExportModule;
const InfiniteRowModelModule = require("../../../../../community-modules/grid-infinite-row-model/src/infiniteRowModelModule").InfiniteRowModelModule;
        
ModuleRegistry.register(ClientSideRowModelModule);
ModuleRegistry.register(CsvExportModule);
ModuleRegistry.register(InfiniteRowModelModule);
