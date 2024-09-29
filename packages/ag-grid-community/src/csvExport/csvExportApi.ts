import type { BeanCollection } from '../context/context';
import type { CsvExportParams } from '../interfaces/exportParams';

export function getDataAsCsv(beans: BeanCollection, params?: CsvExportParams): string | undefined {
    return beans.csvCreator?.getDataAsCsv(params);
}

export function exportDataAsCsv(beans: BeanCollection, params?: CsvExportParams): void {
    beans.csvCreator?.exportDataAsCsv(params);
}
