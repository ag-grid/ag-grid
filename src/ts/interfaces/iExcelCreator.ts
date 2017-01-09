import {CsvExportParams} from "../exportParams";

export interface IExcelCreator{
    exportDataAsExcel (params?: CsvExportParams): void ;

    getDataAsExcelXml (params?: CsvExportParams) : string ;
}