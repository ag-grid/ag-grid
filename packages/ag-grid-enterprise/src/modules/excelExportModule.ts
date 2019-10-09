import {Grid, Module, ModuleNames, Downloader, GridSerializer, ZipContainer, XmlFactory, CsvCreator} from "ag-grid-community";
import {ExcelXlsxFactory} from "./excelExport/excelXlsxFactory";
import {ExcelXmlFactory} from "./excelExport/excelXmlFactory";
import {ExcelCreator} from "./excelExport/excelCreator";

export const ExcelExportModule: Module = {
    moduleName: ModuleNames.ExcelExportModule,
    beans: [
        // beans in this module
        ExcelCreator, ExcelXmlFactory, ExcelXlsxFactory,

        // these beans are part of CSV Export module
        GridSerializer, ZipContainer, XmlFactory, Downloader, CsvCreator]
};

Grid.addModule([ExcelExportModule]);
