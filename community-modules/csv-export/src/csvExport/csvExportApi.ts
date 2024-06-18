import type { BeanCollection, CsvExportParams } from '@ag-grid-community/core';

export function getDataAsCsv(beans: BeanCollection, params?: CsvExportParams): string | undefined {
    return beans.csvCreator?.getDataAsCsv(params);
}

export function exportDataAsCsv(beans: BeanCollection, params?: CsvExportParams): void {
    beans.csvCreator?.exportDataAsCsv(params);
}
