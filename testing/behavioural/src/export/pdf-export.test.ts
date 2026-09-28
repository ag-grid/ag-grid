import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, PinnedRowModule, TextFilterModule } from 'ag-grid-community';
import type { RowPinnedType } from 'ag-grid-community';
import { PdfExportModule, RowGroupingModule } from 'ag-grid-enterprise';

describe('PDF export', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, PdfExportModule, PinnedRowModule, RowGroupingModule, TextFilterModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('exports filtered and sorted rows with pinned-row duplicate suppression', async () => {
        const api = await gridsManager.createGridAndWait('pdf-filter-sort-pinned', {
            columnDefs: [{ field: 'athlete' }, { field: 'country', filter: 'agTextColumnFilter' }, { field: 'score' }],
            rowData: [
                { id: '1', athlete: 'Zoe', country: 'UK', score: 80 },
                { id: '2', athlete: 'Amy', country: 'UK', score: 90 },
                { id: '3', athlete: 'Ben', country: 'UK', score: 70 },
                { id: '4', athlete: 'Cara', country: 'US', score: 95 },
            ],
            getRowId: (params) => params.data.id,
            enableRowPinning: true,
            isRowPinned: (node) => (node.data?.id === '1' ? 'top' : null),
        });
        api.setFilterModel({ country: { type: 'equals', filter: 'UK' } });
        api.applyColumnState({ state: [{ colId: 'athlete', sort: 'asc' }] });
        const exportedAthletes: Array<{ athlete: string; pinned: RowPinnedType }> = [];

        const pdf = api.getDataAsPdf({
            skipPinnedRowDuplicates: true,
            processCellCallback: (params) => {
                if (params.column.getColId() === 'athlete') {
                    exportedAthletes.push({
                        athlete: String(params.value),
                        pinned: params.node?.rowPinned,
                    });
                }
                return String(params.value ?? '');
            },
        });

        expect(exportedAthletes).toEqual([
            { athlete: 'Zoe', pinned: 'top' },
            { athlete: 'Amy', pinned: undefined },
            { athlete: 'Ben', pinned: undefined },
        ]);
        await expectPdf(pdf);
    });

    test('exports expanded row groups and their sorted children', async () => {
        const api = await gridsManager.createGridAndWait('pdf-row-groups', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete', sort: 'asc' },
                { field: 'score', aggFunc: 'sum' },
            ],
            rowData: [
                { athlete: 'Zoe', country: 'UK', score: 80 },
                { athlete: 'Amy', country: 'UK', score: 90 },
                { athlete: 'Cara', country: 'US', score: 95 },
            ],
            groupDefaultExpanded: -1,
        });
        const exportedGroups: string[] = [];
        const exportedAthletes: string[] = [];

        const pdf = api.getDataAsPdf({
            processRowGroupCallback: (params) => {
                const group = String(params.node.key ?? '');
                exportedGroups.push(group);
                return group;
            },
            processCellCallback: (params) => {
                if (params.node && !params.node.group && params.column.getColId() === 'athlete') {
                    exportedAthletes.push(String(params.value));
                }
                return String(params.value ?? '');
            },
        });

        expect(exportedGroups).toEqual(['UK', 'US']);
        expect(exportedAthletes).toEqual(['Amy', 'Zoe', 'Cara']);
        await expectPdf(pdf);
    });

    test('exports default and suppressed column header height spanning', async () => {
        const createHeaderGrid = (id: string, suppressSpanHeaderHeight: boolean) =>
            gridsManager.createGrid(id, {
                columnDefs: [
                    {
                        headerName: 'Athlete Details',
                        children: [{ field: 'athlete' }, { field: 'country' }],
                    },
                    { field: 'age', suppressSpanHeaderHeight },
                ],
                rowData: [],
            });

        const spanningApi = createHeaderGrid('pdf-spanning-header', false);
        const spanningPdf = await readBlobAsText(spanningApi.getDataAsPdf({ headerRowHeight: 20 })!);
        expect(spanningPdf).toMatch(/436 -?\d+(?:\.\d+)? 200 40 re S/);

        const paddedApi = createHeaderGrid('pdf-padded-header', true);
        const paddedPdf = await readBlobAsText(paddedApi.getDataAsPdf({ headerRowHeight: 20 })!);
        expect(paddedPdf).not.toMatch(/436 -?\d+(?:\.\d+)? 200 40 re S/);
        expect(paddedPdf).toMatch(/436 -?\d+(?:\.\d+)? 200 20 re S/);
    });

    test('omits header rows containing only padding groups when configured', async () => {
        const createHeaderGrid = (id: string, hidePaddedHeaderRows: boolean) =>
            gridsManager.createGrid(id, {
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

        const paddedApi = createHeaderGrid('pdf-visible-padding-rows', false);
        const paddedPdf = await readBlobAsText(paddedApi.getDataAsPdf({ headerRowHeight: 20 })!);
        expect(paddedPdf).toMatch(/236 -?\d+(?:\.\d+)? 200 60 re S/);

        const compactApi = createHeaderGrid('pdf-hidden-padding-rows', true);
        const compactPdf = await readBlobAsText(compactApi.getDataAsPdf({ headerRowHeight: 20 })!);
        expect(compactPdf).not.toMatch(/236 -?\d+(?:\.\d+)? 200 60 re S/);
        expect(compactPdf).toMatch(/236 -?\d+(?:\.\d+)? 200 40 re S/);
    });

    test('a span merges only as the grid draws it: up to its pinned lane, over no column left out of the export, and not from a hidden column', async () => {
        const exportSpan = async (pinned: 'left' | null, columnKeys?: string[]) => {
            const api = await gridsManager.createGridAndWait('pdf-col-span', {
                columnDefs: [
                    { field: 'h', hide: true, colSpan: () => 2 },
                    { field: 'a', pinned, colSpan: () => 3 },
                    { field: 'b', pinned },
                    { field: 'c' },
                    { field: 'd' },
                ],
                rowData: [{ h: 'h0', a: 'a0', b: 'b0', c: 'c0', d: 'd0' }],
            });
            const cells: string[] = [];
            const pdf = api.getDataAsPdf({
                columnKeys,
                processCellCallback: (params) => {
                    cells.push(String(params.value));
                    return String(params.value);
                },
            });
            await expectPdf(pdf);
            // body rows are 18 high, so this reads the drawn width of each body cell
            const widths = Array.from((await readBlobAsText(pdf!)).matchAll(/([\d.]+) 18 re S/g), (match) => match[1]);
            gridsManager.reset();
            return { cells, widths };
        };

        expect({
            pinned: await exportSpan('left'),
            columnKeys: await exportSpan(null, ['a', 'c', 'd']),
            hidden: await exportSpan(null, ['h', 'a', 'b', 'c', 'd']),
        }).toEqual({
            pinned: { cells: ['a0', 'c0', 'd0'], widths: ['384.94', '192.47', '192.47'] },
            columnKeys: { cells: ['a0', 'c0', 'd0'], widths: ['200', '200', '200'] },
            hidden: { cells: ['h0', 'a0', 'd0'], widths: ['153.98', '461.93', '153.98'] },
        });
    });
});

async function expectPdf(pdf: Blob | undefined): Promise<void> {
    expect(pdf).toBeInstanceOf(Blob);
    const content = await readBlobAsText(pdf!);
    expect(content.startsWith('%PDF-1.4')).toBe(true);
    expect(content.endsWith('%%EOF')).toBe(true);
}

function readBlobAsText(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsText(blob);
    });
}
