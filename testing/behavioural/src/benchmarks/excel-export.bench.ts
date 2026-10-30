import { bench, suite, vi } from 'vitest';

import type { CellClassRules, ColDef, ColGroupDef, ExcelExportParams, GridApi } from 'ag-grid-community';
import { CellStyleModule, ClientSideRowModelModule, CsvExportModule } from 'ag-grid-community';
import { ExcelExportModule } from 'ag-grid-enterprise';

import { excelStyles } from '../../../../documentation/ag-grid-docs/src/components/example-grid/config/excelStyles';
import { createRowItem, months } from '../../../../documentation/ag-grid-docs/src/components/example-grid/data';
import { BenchGridsManager, benchDefaults } from './bench-utils';

const imageData =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aVZsAAAAASUVORK5CYII=';

const scoreRules: CellClassRules = {
    'good-score': ({ value }) => typeof value === 'number' && value > 50000,
    'bad-score': ({ value }) => typeof value === 'number' && value < 10000,
    'currency-cell': ({ value }) => typeof value === 'number' && value >= 10000 && value <= 50000,
};

const columnDefs: (ColDef | ColGroupDef)[] = [
    {
        headerName: 'Participant',
        children: [
            { field: 'name', cellClass: 'v-align' },
            { field: 'language', cellClass: 'v-align' },
            { field: 'country', cellClass: ['country-cell', 'v-align'] },
        ],
    },
    {
        headerName: 'Game of Choice',
        children: [
            { field: 'game.name', cellClass: () => 'alphabet' },
            { field: 'game.bought', cellClass: 'boolean-type' },
        ],
    },
    { field: 'bankBalance', cellClassRules: { 'currency-cell': ({ value }) => typeof value === 'number' } },
    { field: 'rating', cellClass: 'v-align' },
    { field: 'totalWinnings', cellClassRules: { 'currency-cell': ({ value }) => typeof value === 'number' } },
    {
        headerName: 'Monthly Breakdown',
        children: [
            ...months.map((field) => ({ field, cellClassRules: scoreRules })),
            {
                headerName: 'Average',
                colId: 'monthlyAverage',
                cellClassRules: scoreRules,
                valueGetter: ({ data }) => {
                    const values = months.map((month) => data[month]);
                    return values.reduce((sum, value) => sum + value, 0) / values.length;
                },
            },
        ],
    },
];

suite('Excel export (demo data and styles)', () => {
    const gridsManager = new BenchGridsManager({
        modules: [ClientSideRowModelModule, CellStyleModule, CsvExportModule, ExcelExportModule],
    });

    for (const rowCount of [10_000, 100_000]) {
        for (const variant of ['csv', 'plain', 'styles', 'styles + images', 'compressed + styles + images']) {
            let api: GridApi;
            let output: string | Blob | undefined;
            let resolveDownload: ((blob: Blob) => void) | undefined;
            const images = variant.includes('images');
            const compressed = variant.startsWith('compressed');
            const params: ExcelExportParams = {
                headerRowHeight: 40,
                rowHeight: 30,
                fontSize: 14,
                addImageToCell: images
                    ? (_rowIndex, column, value) => {
                          if (column.getColId() === 'country') {
                              return {
                                  image: {
                                      id: value,
                                      base64: imageData,
                                      imageType: 'png',
                                      width: 20,
                                      height: 12,
                                      position: { offsetX: 17, offsetY: 14 },
                                  },
                                  value,
                              };
                          }
                      }
                    : undefined,
            };

            bench(
                `${rowCount} rows: ${variant}`,
                compressed
                    ? async function exportCompressedWorkbook() {
                          output = await new Promise<Blob>((resolve) => {
                              resolveDownload = resolve;
                              api.exportDataAsExcel(params);
                          });
                      }
                    : function exportWorkbook() {
                          output = variant === 'csv' ? api.getDataAsCsv() : api.getDataAsExcel(params);
                      },
                benchDefaults({
                    setup: async () => {
                        await gridsManager.reset();
                        const rowData = Array.from({ length: rowCount }, (_, row) => createRowItem(row, 22, 9, 22));
                        api = gridsManager.createGrid('export', {
                            columnDefs,
                            rowData,
                            excelStyles: variant === 'plain' ? [] : excelStyles,
                        });
                        api.flushAllAnimationFrames();
                        if (compressed) {
                            vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
                                if (blob instanceof Blob) {
                                    resolveDownload?.(blob);
                                }
                                return 'blob:export-benchmark';
                            });
                            vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
                        }
                    },
                    teardown: () => {
                        const size = typeof output === 'string' ? output.length : output?.size;
                        if (!size) {
                            throw new Error('Export produced no data');
                        }
                        output = undefined;
                        vi.restoreAllMocks();
                        gridsManager.destroyAll();
                    },
                })
            );
        }
    }
});
