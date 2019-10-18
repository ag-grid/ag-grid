import {Module, ModuleNames} from "@ag-community/grid-core";
import {CsvCreator} from "./csvExport/csvCreator";
import {Downloader} from "./csvExport/downloader";
import {XmlFactory} from "./csvExport/xmlFactory";
import {GridSerializer} from "./csvExport/gridSerializer";
import {ZipContainer} from "./csvExport/zipContainer";

export const CsvExportModule: Module = {
    moduleName: ModuleNames.CsvExportModule,
    beans: [CsvCreator, Downloader, XmlFactory, GridSerializer, ZipContainer]
};

