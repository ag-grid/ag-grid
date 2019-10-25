import { ModuleNames } from "@ag-community/grid-core";
import { EnterpriseCoreModule } from "@ag-enterprise/grid-core";
import { ExcelXlsxFactory } from "./excelExport/excelXlsxFactory";
import { ExcelXmlFactory } from "./excelExport/excelXmlFactory";
import { ExcelCreator } from "./excelExport/excelCreator";
import { CsvCreator, Downloader, GridSerializer, XmlFactory, ZipContainer } from "@ag-community/grid-csv-export";
import { CsvExportModule } from "@ag-community/grid-csv-export";
export var ExcelExportModule = {
    moduleName: ModuleNames.ExcelExportModule,
    beans: [
        // beans in this module
        ExcelCreator, ExcelXmlFactory, ExcelXlsxFactory,
        // these beans are part of CSV Export module
        GridSerializer, ZipContainer, XmlFactory, Downloader, CsvCreator
    ],
    dependantModules: [
        CsvExportModule,
        EnterpriseCoreModule
    ]
};
