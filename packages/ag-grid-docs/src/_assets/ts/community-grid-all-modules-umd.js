// for js examples that just require community functionality (landing pages, vanilla community examples etc)

require("../../../../../community-modules/grid-core/src/styles/ag-grid.scss");

require("../../../../../community-modules/grid-core/src/styles/ag-theme-material/sass/ag-theme-material.scss");
require("../../../../../community-modules/grid-core/src/styles/ag-theme-fresh/sass/ag-theme-fresh.scss");
require("../../../../../community-modules/grid-core/src/styles/ag-theme-dark/sass/ag-theme-dark.scss");
require("../../../../../community-modules/grid-core/src/styles/ag-theme-blue/sass/ag-theme-blue.scss");
require("../../../../../community-modules/grid-core/src/styles/ag-theme-bootstrap/sass/ag-theme-bootstrap.scss");
require("../../../../../community-modules/grid-core/src/styles/ag-theme-balham/sass/ag-theme-balham.scss");
require("../../../../../community-modules/grid-core/src/styles/ag-theme-balham-dark/sass/ag-theme-balham-dark.scss");

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