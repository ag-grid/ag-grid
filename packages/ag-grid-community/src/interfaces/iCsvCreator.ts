import type { ExportEventSource } from '../events';
import type { CsvExportParams } from './exportParams';

export interface ICsvCreator {
    getDataAsCsv(params?: CsvExportParams, skipDefaultParams?: boolean): string;
    exportDataAsCsv(params?: CsvExportParams, source?: ExportEventSource): Promise<void>;
}
