import { TestGridsManager, objectUrls } from 'ag-test-utils';
import * as XLSX from 'xlsx';

import type { ExcelExportParams } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { ExcelExportModule } from 'ag-grid-enterprise';

describe('Excel export header layout', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, ExcelExportModule] });

    beforeEach(() => {
        objectUrls.init();
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test.each<NonNullable<ExcelExportParams['exportAsExcelTable']>>([true, { name: 'Athletes' }])(
        'keeps table headers unmerged with exportAsExcelTable=%j',
        async (exportAsExcelTable) => {
            const api = gridsManager.createGrid('excel-table-spanning-header', {
                columnDefs: [
                    {
                        headerName: 'Athlete',
                        children: [{ field: 'athlete' }, { field: 'age' }, { field: 'country' }],
                    },
                    {
                        headerName: 'Medals',
                        children: [{ field: 'gold' }, { field: 'silver' }, { field: 'bronze' }],
                    },
                    { field: 'total' },
                ],
                defaultExcelExportParams: { exportAsExcelTable },
                rowData: [
                    {
                        athlete: 'Michael Phelps',
                        age: 23,
                        country: 'United States',
                        gold: 8,
                        silver: 0,
                        bronze: 0,
                        total: 8,
                    },
                ],
            });

            api.exportDataAsExcel();
            const data = new Uint8Array(await (await objectUrls.pullBlob()).arrayBuffer());
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            expect((worksheet['!merges'] ?? []).map(XLSX.utils.encode_range)).toEqual(['A1:C1', 'D1:F1']);
            expect(rows[1]).toEqual(['Athlete', 'Age', 'Country', 'Gold', 'Silver', 'Bronze', 'Total']);
            expect(rows[2]).toEqual(['Michael Phelps', 23, 'United States', 8, 0, 0, 8]);

            const tableFile = XLSX.CFB.find(XLSX.CFB.read(data, { type: 'array' }), '/xl/tables/table1.xml');
            expect(tableFile).toBeTruthy();
            const tableXml = new DOMParser().parseFromString(new TextDecoder().decode(tableFile.content), 'text/xml');
            expect(tableXml.querySelector('table')?.getAttribute('ref')).toBe('A2:G3');
            expect(
                Array.from(tableXml.querySelectorAll('tableColumn'), (column) => column.getAttribute('name'))
            ).toEqual(rows[1]);

            api.exportDataAsExcel({ exportAsExcelTable: false });
            const ordinaryWorkbook = XLSX.read(new Uint8Array(await (await objectUrls.pullBlob()).arrayBuffer()), {
                type: 'array',
            });
            const ordinaryWorksheet = ordinaryWorkbook.Sheets[ordinaryWorkbook.SheetNames[0]];
            expect((ordinaryWorksheet['!merges'] ?? []).map(XLSX.utils.encode_range)).toEqual([
                'A1:C1',
                'D1:F1',
                'G1:G2',
            ]);
            expect(ordinaryWorksheet.G1.v).toBe('Total');
        }
    );

    test.each([false, true])('retains hidePaddedHeaderRows=%s for Excel tables', async (hidePaddedHeaderRows) => {
        const api = gridsManager.createGrid('excel-table-padded-headers', {
            columnDefs: [
                {
                    headerName: 'Athlete Details',
                    children: [
                        { field: 'athlete' },
                        {
                            headerName: 'Meta Data',
                            children: [{ field: 'country' }],
                        },
                    ],
                },
                { field: 'gold' },
            ],
            hidePaddedHeaderRows,
            rowData: [{ athlete: 'Michael Phelps', country: 'United States', gold: 8 }],
        });

        api.exportDataAsExcel({
            exportAsExcelTable: true,
            columnKeys: ['athlete', 'gold'],
            prependContent: [{ cells: [{ data: { type: 'String', value: 'Report' } }] }],
            appendContent: [{ cells: [{ data: { type: 'String', value: 'End' } }] }],
        });
        const data = new Uint8Array(await (await objectUrls.pullBlob()).arrayBuffer());
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const headerRow = hidePaddedHeaderRows ? 3 : 4;

        expect(worksheet['!merges'] ?? []).toEqual([]);
        expect(worksheet[`A${headerRow}`].v).toBe('Athlete');
        expect(worksheet[`B${headerRow}`].v).toBe('Gold');
        expect(worksheet[`A${headerRow + 1}`].v).toBe('Michael Phelps');
        expect(worksheet[`B${headerRow + 1}`].v).toBe(8);
        expect(worksheet[`A${headerRow + 2}`].v).toBe('End');

        const tableFile = XLSX.CFB.find(XLSX.CFB.read(data, { type: 'array' }), '/xl/tables/table1.xml');
        expect(tableFile).toBeTruthy();
        const tableXml = new DOMParser().parseFromString(new TextDecoder().decode(tableFile.content), 'text/xml');
        expect(tableXml.querySelector('table')?.getAttribute('ref')).toBe(`A${headerRow}:B${headerRow + 1}`);
    });

    test('merges default spanning headers vertically and retains suppressed padding', async () => {
        const exportHeaderMerges = async (id: string, suppressSpanHeaderHeight: boolean): Promise<string[]> => {
            const api = gridsManager.createGrid(id, {
                columnDefs: [
                    {
                        headerName: 'Athlete Details',
                        children: [{ field: 'athlete' }, { field: 'country' }],
                    },
                    { field: 'age', suppressSpanHeaderHeight },
                ],
                rowData: [],
            });
            api.exportDataAsExcel();
            const workbook = XLSX.read(new Uint8Array(await (await objectUrls.pullBlob()).arrayBuffer()), {
                type: 'array',
            });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            return (worksheet['!merges'] ?? []).map(XLSX.utils.encode_range);
        };

        expect((await exportHeaderMerges('excel-spanning-header', false)).sort()).toEqual(['A1:B1', 'C1:C2']);
        expect(await exportHeaderMerges('excel-padded-header', true)).toEqual(['A1:B1']);
    });

    test('spans column headers through multiple padded rows', async () => {
        const api = gridsManager.createGrid('excel-deep-spanning-header', {
            columnDefs: [
                {
                    headerName: 'Group',
                    children: [
                        {
                            headerName: 'Subgroup',
                            children: [{ field: 'athlete' }],
                        },
                    ],
                },
                { field: 'age' },
            ],
            rowData: [],
        });
        api.exportDataAsExcel();
        const workbook = XLSX.read(new Uint8Array(await (await objectUrls.pullBlob()).arrayBuffer()), {
            type: 'array',
        });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        expect((worksheet['!merges'] ?? []).map(XLSX.utils.encode_range)).toEqual(['B1:B3']);
        const headerRows = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
        expect(headerRows[0]).toEqual(['Group', 'Age']);
        expect(headerRows[1]).toEqual(['Subgroup']);
        expect(headerRows[2]).toEqual(['Athlete']);
    });

    test('omits header rows containing only padding groups when configured', async () => {
        const exportWorksheet = async (id: string, hidePaddedHeaderRows: boolean) => {
            const api = gridsManager.createGrid(id, {
                columnDefs: [
                    {
                        headerName: 'Athlete Details',
                        children: [
                            { field: 'athlete' },
                            {
                                headerName: 'Meta Data',
                                columnGroupShow: 'open',
                                children: [{ field: 'country' }],
                            },
                        ],
                    },
                    { field: 'gold' },
                ],
                hidePaddedHeaderRows,
                rowData: [],
            });
            api.exportDataAsExcel();
            const workbook = XLSX.read(new Uint8Array(await (await objectUrls.pullBlob()).arrayBuffer()), {
                type: 'array',
            });
            return workbook.Sheets[workbook.SheetNames[0]];
        };

        const paddedWorksheet = await exportWorksheet('excel-visible-padding-rows', false);
        expect((paddedWorksheet['!merges'] ?? []).map(XLSX.utils.encode_range).sort()).toEqual(['A2:A3', 'B1:B3']);
        expect(XLSX.utils.sheet_to_json<string[]>(paddedWorksheet, { header: 1 })).toHaveLength(3);

        const trimmedWorksheet = await exportWorksheet('excel-hidden-padding-rows', true);
        expect((trimmedWorksheet['!merges'] ?? []).map(XLSX.utils.encode_range)).toEqual(['B1:B2']);
        expect(XLSX.utils.sheet_to_json<string[]>(trimmedWorksheet, { header: 1 })).toHaveLength(2);
    });
});
