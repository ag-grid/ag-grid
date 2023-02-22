// for js examples that just require community functionality (landing pages, vanilla community examples etc)

const  ModuleRegistry = require("../../../../../grid-community-modules/core/dist/cjs/es5/main");
export * from "../../../../../grid-community-modules/core/dist/cjs/es5/main";

/* MODULES - Don't delete this line */
require("../../../../../grid-community-modules/client-side-row-model/dist/cjs/es5/clientSideRowModelModule");
const ClientSideRowModelModule = require("../../../../../grid-community-modules/client-side-row-model/dist/cjs/es5/clientSideRowModelModule").ClientSideRowModelModule;

require("../../../../../grid-community-modules/csv-export/dist/cjs/es5/csvExportModule");
const CsvExportModule = require("../../../../../grid-community-modules/csv-export/dist/cjs/es5/csvExportModule").CsvExportModule;

require("../../../../../grid-community-modules/infinite-row-model/dist/cjs/es5/infiniteRowModelModule");
const InfiniteRowModelModule = require("../../../../../grid-community-modules/infinite-row-model/dist/cjs/es5/infiniteRowModelModule").InfiniteRowModelModule;

ModuleRegistry.ModuleRegistry.register(ClientSideRowModelModule);
ModuleRegistry.ModuleRegistry.register(CsvExportModule);
ModuleRegistry.ModuleRegistry.register(InfiniteRowModelModule);
ModuleRegistry.ModuleRegistry.setIsBundled();