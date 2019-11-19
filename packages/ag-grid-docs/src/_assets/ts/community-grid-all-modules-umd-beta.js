// for js examples that just require community functionality (landing pages, vanilla community examples etc)

const  ModuleRegistry = require("../../../../../community-modules/grid-core/src/ts/main");
export * from "../../../../../community-modules/grid-core/src/ts/main";

/* MODULES - Don't delete this line */
require("../../../../../community-modules/grid-client-side-row-model/dist/cjs/clientSideRowModelModule");
const ClientSideRowModelModule = require("../../../../../community-modules/grid-client-side-row-model/dist/cjs/clientSideRowModelModule").ClientSideRowModelModule; 
        
require("../../../../../community-modules/grid-csv-export/dist/cjs/csvExportModule");
const CsvExportModule = require("../../../../../community-modules/grid-csv-export/dist/cjs/csvExportModule").CsvExportModule; 
        
require("../../../../../community-modules/grid-infinite-row-model/dist/cjs/infiniteRowModelModule");
const InfiniteRowModelModule = require("../../../../../community-modules/grid-infinite-row-model/dist/cjs/infiniteRowModelModule").InfiniteRowModelModule; 
        
ModuleRegistry.ModuleRegistry.register(ClientSideRowModelModule);
ModuleRegistry.ModuleRegistry.register(CsvExportModule);
ModuleRegistry.ModuleRegistry.register(InfiniteRowModelModule);