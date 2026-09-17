import type { CsvExportParams } from './exportParams';

export interface ICsvCreator {
    getDataAsCsv(params?: CsvExportParams, skipDefaultParams?: boolean): string;
    exportDataAsCsv(params?: CsvExportParams): void;

    /** private methods */
    _exportWithSource(source: 'api' | 'contextMenu', params?: CsvExportParams): void;
}
