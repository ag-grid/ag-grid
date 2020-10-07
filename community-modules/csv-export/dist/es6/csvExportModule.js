import { ModuleNames } from "@ag-grid-community/core";
import { CsvCreator } from "./csvExport/csvCreator";
import { Downloader } from "./csvExport/downloader";
import { XmlFactory } from "./csvExport/xmlFactory";
import { GridSerializer } from "./csvExport/gridSerializer";
import { ZipContainer } from "./csvExport/zipContainer";
export var CsvExportModule = {
    moduleName: ModuleNames.CsvExportModule,
    beans: [CsvCreator, Downloader, XmlFactory, GridSerializer, ZipContainer]
};
