import type { BeanCollection, CsvExportParams } from '../main';

export function getDataAsCsv(beans: BeanCollection, params?: CsvExportParams): string | undefined {
    return beans.csvCreator?.getDataAsCsv(params);
}

export function exportDataAsCsv(beans: BeanCollection, params?: CsvExportParams): void {
    beans.csvCreator?.exportDataAsCsv(params);
}
