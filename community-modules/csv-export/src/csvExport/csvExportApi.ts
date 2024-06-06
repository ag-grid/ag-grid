import type { BeanCollection, CsvExportParams } from '@ag-grid-community/core';
import { ModuleNames, ModuleRegistry } from '@ag-grid-community/core';

export function getDataAsCsv(beans: BeanCollection, params?: CsvExportParams): string | undefined {
    if (ModuleRegistry.__assertRegistered(ModuleNames.CsvExportModule, 'api.getDataAsCsv', beans.context.getGridId())) {
        return beans.csvCreator!.getDataAsCsv(params);
    }
}

export function exportDataAsCsv(beans: BeanCollection, params?: CsvExportParams): void {
    if (
        ModuleRegistry.__assertRegistered(ModuleNames.CsvExportModule, 'api.exportDataAsCsv', beans.context.getGridId())
    ) {
        beans.csvCreator!.exportDataAsCsv(params);
    }
}
