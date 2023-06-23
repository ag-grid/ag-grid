// for js examples that just require community functionality (landing pages, vanilla community examples etc)

const  ModuleRegistry = require("../../../../../grid-community-modules/core/dist/esm/es6/main");
export * from "../../../../../grid-community-modules/core/dist/esm/es6/main";

/* MODULES - Don't delete this line */
require("../../../../../grid-community-modules/client-side-row-model/dist/esm/es6/clientSideRowModelModule");
const ClientSideRowModelModule = require("../../../../../grid-community-modules/client-side-row-model/dist/esm/es6/clientSideRowModelModule").ClientSideRowModelModule;

require("../../../../../grid-community-modules/csv-export/dist/esm/es6/csvExportModule");
const CsvExportModule = require("../../../../../grid-community-modules/csv-export/dist/esm/es6/csvExportModule").CsvExportModule;

require("../../../../../grid-community-modules/infinite-row-model/dist/esm/es6/infiniteRowModelModule");
const InfiniteRowModelModule = require("../../../../../grid-community-modules/infinite-row-model/dist/esm/es6/infiniteRowModelModule").InfiniteRowModelModule;

ModuleRegistry.ModuleRegistry.register(ClientSideRowModelModule);
ModuleRegistry.ModuleRegistry.register(CsvExportModule);
ModuleRegistry.ModuleRegistry.register(InfiniteRowModelModule);
ModuleRegistry.ModuleRegistry.__setIsBundled();