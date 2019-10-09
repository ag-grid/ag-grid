import {Module} from "../interfaces/iModule";
import {ModuleNames} from "./moduleNames";
import {Grid} from "../grid";
import {CsvCreator} from "./csvExport/csvCreator";
import {Downloader} from "./csvExport/downloader";
import {XmlFactory} from "./csvExport/xmlFactory";
import {GridSerializer} from "./csvExport/gridSerializer";
import {ZipContainer} from "./csvExport/zipContainer";

export const CsvExportModule: Module = {
    moduleName: ModuleNames.CsvExportModule,
    beans: [CsvCreator, Downloader, XmlFactory, GridSerializer, ZipContainer ]
};

Grid.addModule([CsvExportModule]);
