import { CsvExportParams } from "./exportParams";

export interface ICsvCreator {
    getDataAsCsv(params?: CsvExportParams, skipDefaultParams?: boolean): Promise<string> | string;
    exportDataAsCsv(params?: CsvExportParams): Promise<string> | string;
}
