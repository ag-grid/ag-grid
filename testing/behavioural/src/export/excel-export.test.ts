import { TestGridsManager, objectUrls } from 'ag-test-utils';
import * as XLSX from 'xlsx';

import type { ExcelExportParams, GridApi } from 'ag-grid-community';
import { CellStyleModule, ClientSideRowModelModule } from 'ag-grid-community';
import { ExcelExportModule } from 'ag-grid-enterprise';

describe('Excel export', () => {
    const gridsManager = new TestGridsManager({
        modules: [CellStyleModule, ClientSideRowModelModule, ExcelExportModule],
    });

    beforeEach(() => {
        objectUrls.init();
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const exportSheet = async (api: GridApi, params?: ExcelExportParams) => {
        api.exportDataAsExcel(params);
        const workbook = XLSX.read(new Uint8Array(await (await objectUrls.pullBlob()).arrayBuffer()), {
            type: 'array',
        });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        return {
            merges: (worksheet['!merges'] ?? []).map(XLSX.utils.encode_range),
            rows: XLSX.utils.sheet_to_json(worksheet, { header: 1 }),
        };
    };

    const exportFrozenColumnCount = async (api: GridApi, params: ExcelExportParams) => {
        api.exportDataAsExcel(params);
        const zip = XLSX.CFB.read(new Uint8Array(await (await objectUrls.pullBlob()).arrayBuffer()), { type: 'array' });
        const sheetXml = new TextDecoder().decode(XLSX.CFB.find(zip, '/xl/worksheets/sheet1.xml').content);
        return Number(/<pane\b[^>]*xSplit="(\d+)"/.exec(sheetXml)?.[1] ?? 0);
    };

    test.each([false, true])('reuses image bytes but preserves each placement (compressed: %s)', async (compressed) => {
        const api = gridsManager.createGrid('excel-repeated-images', {
            columnDefs: [{ field: 'country' }],
            rowData: [{ country: 'UK' }, { country: 'UK' }, { country: 'UK' }],
        });
        const params: ExcelExportParams = {
            addImageToCell: (_row, _column, value) => ({
                image: {
                    id: value,
                    base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aVZsAAAAASUVORK5CYII=',
                    imageType: 'png',
                    width: 20,
                    height: 12,
                },
                value,
            }),
        };
        let blob: Blob | string | undefined;
        if (compressed) {
            api.exportDataAsExcel(params);
            blob = await objectUrls.pullBlob();
        } else {
            blob = api.getDataAsExcel(params);
        }
        expect(blob).toBeInstanceOf(Blob);
        if (!(blob instanceof Blob)) {
            throw new Error('Expected an Excel workbook');
        }
        const zip = XLSX.CFB.read(new Uint8Array(await blob.arrayBuffer()), { type: 'array' });
        const drawingXml = new TextDecoder().decode(XLSX.CFB.find(zip, '/xl/drawings/drawing1.xml').content);
        const drawing = new DOMParser().parseFromString(drawingXml, 'application/xml');
        const anchors = Array.from(drawing.getElementsByTagName('xdr:twoCellAnchor'));

        expect(zip.FullPaths.filter((path: string) => path.endsWith('.png'))).toHaveLength(1);
        expect(anchors).toHaveLength(3);
        expect(anchors.map((anchor) => anchor.getElementsByTagName('xdr:row')[0].textContent)).toEqual(['1', '2', '3']);
        expect(anchors.map((anchor) => anchor.getElementsByTagName('a:blip')[0].getAttribute('r:embed'))).toEqual([
            'rId1',
            'rId1',
            'rId1',
        ]);
    });

    test('number formats quote `$` only outside square-bracket sections', async () => {
        const api = gridsManager.createGrid('excel-number-format-brackets', {
            columnDefs: [
                { field: 'a', cellClass: 'bracketed' },
                { field: 'b', cellClass: 'unclosed' },
            ],
            rowData: [{ a: 1, b: 2 }],
            excelStyles: [
                { id: 'bracketed', numberFormat: { format: '[Red]$#,##0;[$€-407]0' } },
                { id: 'unclosed', numberFormat: { format: '0$[$' } },
            ],
        });

        api.exportDataAsExcel();
        const zip = XLSX.CFB.read(new Uint8Array(await (await objectUrls.pullBlob()).arrayBuffer()), { type: 'array' });
        const stylesXml = new TextDecoder().decode(XLSX.CFB.find(zip, '/xl/styles.xml').content);
        const formatCodes = [...stylesXml.matchAll(/<numFmt\b[^>]*formatCode="([^"]*)"/g)].map((match) => match[1]);

        expect(formatCodes).toEqual(
            expect.arrayContaining(['[Red]&quot;$&quot;#,##0;[$€-407]0', '0&quot;$&quot;[&quot;$&quot;'])
        );
    });

    test('freezeColumns counts the frozen columns once, whatever the body cells span', async () => {
        const api = gridsManager.createGrid('excel-freeze-col-span', {
            columnDefs: [
                { field: 'a', pinned: 'left', colSpan: (params) => (params.node?.rowIndex === 0 ? 2 : 1) },
                { field: 'b', pinned: 'left' },
                { field: 'c' },
            ],
            rowData: [
                { a: 'a0', b: 'b0', c: 'c0' },
                { a: 'a1', b: 'b1', c: 'c1' },
            ],
        });

        expect(await exportFrozenColumnCount(api, { freezeColumns: 'pinned' })).toBe(2);
        expect(await exportFrozenColumnCount(api, { freezeColumns: ({ column }) => column.getColId() !== 'c' })).toBe(
            2
        );

        api.applyColumnState({ state: [{ colId: 'c', pinned: 'left' }] });
        expect(await exportFrozenColumnCount(api, { freezeColumns: 'pinned' })).toBe(3);
    });

    test('a span past the last exported column merges only up to it, as the grid draws it', async () => {
        const api = gridsManager.createGrid('excel-col-span', {
            columnDefs: [
                { field: 'a', colSpan: (params) => (params.node?.rowIndex === 0 ? Infinity : 1) },
                { field: 'b', colSpan: (params) => (params.node?.rowIndex === 1 ? 5 : 1) },
                { field: 'c' },
            ],
            rowData: [
                { a: 'a0', b: 'b0', c: 'c0' },
                { a: 'a1', b: 'b1', c: 'c1' },
            ],
        });

        expect(await exportSheet(api)).toEqual({
            merges: ['A2:C2', 'B3:C3'],
            rows: [['A', 'B', 'C'], ['a0'], ['a1', 'b1']],
        });
    });

    test('a span over a column left out of the export merges nothing, and an exported hidden column spans only itself', async () => {
        const api = gridsManager.createGrid('excel-col-span-column-keys', {
            columnDefs: [
                { field: 'h', hide: true, colSpan: () => 2 },
                { field: 'a', colSpan: () => 2 },
                { field: 'b' },
                { field: 'c' },
            ],
            rowData: [{ h: 'h0', a: 'a0', b: 'b0', c: 'c0' }],
        });

        expect({
            columnKeys: await exportSheet(api, { columnKeys: ['a', 'c'] }),
            hidden: await exportSheet(api, { columnKeys: ['h', 'a', 'b', 'c'] }),
        }).toEqual({
            columnKeys: {
                merges: [],
                rows: [
                    ['A', 'C'],
                    ['a0', 'c0'],
                ],
            },
            hidden: {
                merges: ['B2:C2'],
                rows: [
                    ['H', 'A', 'B', 'C'],
                    ['h0', 'a0', undefined, 'c0'],
                ],
            },
        });
    });

    test('a pinned span merges only up to its pinned lane, so the cells past the lane are exported', async () => {
        const api = gridsManager.createGrid('excel-col-span-pinned', {
            columnDefs: [
                { field: 'a', pinned: 'left', colSpan: () => 3 },
                { field: 'b', pinned: 'left' },
                { field: 'c' },
                { field: 'd' },
            ],
            rowData: [{ a: 'a0', b: 'b0', c: 'c0', d: 'd0' }],
        });

        expect(await exportSheet(api)).toEqual({
            merges: ['A2:B2'],
            rows: [
                ['A', 'B', 'C', 'D'],
                ['a0', undefined, 'c0', 'd0'],
            ],
        });
    });
});
