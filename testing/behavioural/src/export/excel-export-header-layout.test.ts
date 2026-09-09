import { TestGridsManager, objectUrls } from 'ag-test-utils';
import * as XLSX from 'xlsx';

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
