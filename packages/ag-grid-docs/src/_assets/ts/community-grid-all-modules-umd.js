// for js examples that just require community functionality (landing pages, vanilla community examples etc)

require("../../../../../community-modules/grid-core/dist/styles/ag-grid.css");

require("../../../../../community-modules/grid-core/dist/styles/ag-theme-material.css");
require("../../../../../community-modules/grid-core/dist/styles/ag-theme-fresh.css");
require("../../../../../community-modules/grid-core/dist/styles/ag-theme-dark.css");
require("../../../../../community-modules/grid-core/dist/styles/ag-theme-blue.css");
require("../../../../../community-modules/grid-core/dist/styles/ag-theme-bootstrap.css");
require("../../../../../community-modules/grid-core/dist/styles/ag-theme-alpine.css");
require("../../../../../community-modules/grid-core/dist/styles/ag-theme-alpine-dark.css");
require("../../../../../community-modules/grid-core/dist/styles/ag-theme-balham.css");
require("../../../../../community-modules/grid-core/dist/styles/ag-theme-balham-dark.css");

const  ModuleRegistry = require("../../../../../community-modules/grid-core/dist/cjs/main");
export * from "../../../../../community-modules/grid-core/dist/cjs/main";

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