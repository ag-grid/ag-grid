/**
 * Issue: a set of Excel export inputs that typecheck against the public API but produce a workbook Excel refuses to
 * open ("We found a problem with some content ... Do you want us to try to recover as much as we can?").
 *
 * Setup: ExcelExportModule plus CellStyleModule, one small grid per case, each exported with the input named in the
 * test title. Every case was opened in Excel 16.114 for Mac and triggered the recovery prompt.
 *
 * Expected: the generated parts are valid SpreadsheetML, so Excel opens the file silently. Each test asserts the
 * specific invariant the part violates, so it stays red until that part is fixed.
 *
 * Actual: the part named in each test contains the invalid construct quoted in its assertion.
 *
 * Reported on: vue 34.3.1 (the prependContent cases); the remaining cases were found while reviewing the same code.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). One search in January 2026 (vue 34.3.1) for:
 * "exportDataAsExcel prependContent ExcelRow cells format broken corrupt file".
 *
 * Four cases assert behaviour the docs already describe as a limitation; each is marked DOCUMENTED LIMITATION or
 * GENERALLY WARNED above its test. They are included because the input typechecks and the result is a corrupt file
 * rather than a reported error.
 */
import { TestGridsManager, objectUrls } from 'ag-test-utils';
import * as XLSX from 'xlsx';

import type { ExcelExportParams, GridOptions } from 'ag-grid-community';
import { CellStyleModule, ClientSideRowModelModule } from 'ag-grid-community';
import { ExcelExportModule } from 'ag-grid-enterprise';

const PNG =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aVZsAAAAASUVORK5CYII=';

const EXCEL_ERROR_LITERALS = ['#NULL!', '#DIV/0!', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#N/A'];

interface WorkbookParts {
    find(path: string): string | undefined;
    get(path: string): string;
}

const readParts = (bytes: Uint8Array): WorkbookParts => {
    const zip = XLSX.CFB.read(bytes, { type: 'array' });
    const find = (path: string) => {
        const entry = XLSX.CFB.find(zip, path);
        return entry ? new TextDecoder().decode(entry.content) : undefined;
    };
    return {
        find,
        get: (path) => {
            const xml = find(path);
            if (xml === undefined) {
                throw new Error(`${path} is missing from the exported workbook`);
            }
            return xml;
        },
    };
};

const attrs = (xml: string, tag: string): string[] =>
    [...xml.matchAll(new RegExp(`<${tag}\\b([^>]*)/?>`, 'g'))].map((m) => m[1]);

const attr = (tagAttrs: string, name: string): string | undefined =>
    new RegExp(`\\b${name}="([^"]*)"`).exec(tagAttrs)?.[1];

describe('Excel export inputs that produce a file Excel refuses to open', () => {
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

    const oneColumn: GridOptions = { columnDefs: [{ field: 'a' }], rowData: [{ a: 'x' }, { a: 'y' }] };

    const exportParts = async (options: GridOptions, params: ExcelExportParams) => {
        const api = gridsManager.createGrid('excel-corrupt', options);
        api.exportDataAsExcel(params);
        return readParts(new Uint8Array(await (await objectUrls.pullBlob()).arrayBuffer()));
    };

    const sheetXml = async (options: GridOptions, params: ExcelExportParams) =>
        (await exportParts(options, params)).get('/xl/worksheets/sheet1.xml');

    const sheetNames = (workbookXml: string) => attrs(workbookXml, 'sheet').map((a) => attr(a, 'name'));

    test('prependContent merged row wider than the grid: every <col> has min and max', async () => {
        const xml = await sheetXml(oneColumn, {
            prependContent: [
                {
                    cells: [
                        { data: { type: 'String', value: 'Title' }, mergeAcross: 1 },
                        { data: { type: 'String', value: 'Note' } },
                    ],
                },
            ],
        });
        const cols = attrs(xml, 'col');
        expect(cols.length).toBeGreaterThan(0);
        for (const col of cols) {
            expect(col).toMatch(/\bmin="\d+"/);
            expect(col).toMatch(/\bmax="\d+"/);
        }
    });

    test('exportAsExcelTable with a prependContent row wider than the grid: no empty table column name', async () => {
        const parts = await exportParts(oneColumn, {
            exportAsExcelTable: true,
            prependContent: [
                { cells: [{ data: { type: 'String', value: 'Title' } }, { data: { type: 'String', value: 'Note' } }] },
            ],
        });
        const names = attrs(parts.get('/xl/tables/table1.xml'), 'tableColumn').map((a) => attr(a, 'name'));
        expect(names).not.toContain('');
    });

    /**
     * DOCUMENTED LIMITATION (excel-export-tables: "Excel tables require non-empty and unique table column names").
     * It would still be preferable to fix it automatically (e.g. append a number to a duplicate name), signal an
     * error to the app, or put an error in the downloaded file - anything but appearing to save a file that is
     * later found unopenable.
     */
    test('exportAsExcelTable with duplicate header names: table column names are unique', async () => {
        const parts = await exportParts(
            {
                columnDefs: [
                    { field: 'a', headerName: 'Total' },
                    { field: 'b', headerName: 'Total' },
                ],
                rowData: [{ a: 1, b: 2 }],
            },
            { exportAsExcelTable: true }
        );
        const names = attrs(parts.get('/xl/tables/table1.xml'), 'tableColumn').map((a) => attr(a, 'name'));
        expect(new Set(names).size).toBe(names.length);
    });

    test('exportAsExcelTable with skipColumnHeaders: the table ref does not start at row 0', async () => {
        const parts = await exportParts(oneColumn, { exportAsExcelTable: true, skipColumnHeaders: true });
        const tableXml = parts.find('/xl/tables/table1.xml');
        if (tableXml !== undefined) {
            expect(attr(attrs(tableXml, 'table')[0], 'ref')).toMatch(/^[A-Z]+[1-9]\d*:[A-Z]+[1-9]\d*$/);
        }
    });

    test('exportAsExcelTable with a name that is a cell reference: the table name is not a cell reference', async () => {
        const parts = await exportParts(oneColumn, { exportAsExcelTable: { name: 'A1' } });
        const table = attrs(parts.get('/xl/tables/table1.xml'), 'table')[0];
        expect(attr(table, 'displayName')).not.toMatch(/^[A-Z]{1,3}\d+$/i);
        expect(attr(table, 'name')).not.toMatch(/^[A-Z]{1,3}\d+$/i);
    });

    test('sheetName with a character Excel forbids: the sheet name is sanitised', async () => {
        const parts = await exportParts(oneColumn, { sheetName: 'Sales/2024' });
        for (const name of sheetNames(parts.get('/xl/workbook.xml'))) {
            expect(name).not.toMatch(/[[\]:*?/\\]/);
        }
    });

    test('empty sheetName: the sheet name is not empty', async () => {
        const parts = await exportParts(oneColumn, { sheetName: '' });
        for (const name of sheetNames(parts.get('/xl/workbook.xml'))) {
            expect(name).not.toBe('');
        }
    });

    test('duplicate 31-character sheet names: the deduplicated name stays within 31 characters', async () => {
        const api = gridsManager.createGrid('excel-corrupt', oneColumn);
        const sheetName = 'abcdefghijklmnopqrstuvwxyz12345';
        const data = [api.getSheetDataForExcel({ sheetName }), api.getSheetDataForExcel({ sheetName })].filter(
            (sheet): sheet is string => sheet != null
        );
        expect(data).toHaveLength(2);
        const blob = api.getMultipleSheetsAsExcel({ data });
        if (blob === undefined) {
            throw new Error('getMultipleSheetsAsExcel returned no workbook');
        }
        const parts = readParts(new Uint8Array(await blob.arrayBuffer()));
        const names = sheetNames(parts.get('/xl/workbook.xml'));
        expect(names).toHaveLength(2);
        for (const name of names) {
            expect(name?.length).toBeLessThanOrEqual(31);
        }
    });

    test('author containing an ampersand: core.xml escapes it', async () => {
        const parts = await exportParts(oneColumn, { author: 'Smith & Sons' });
        expect(parts.get('/docProps/core.xml')).toContain('<dc:creator>Smith &amp; Sons</dc:creator>');
    });

    test('image id and altText containing XML characters: the drawing escapes them', async () => {
        const parts = await exportParts(oneColumn, {
            addImageToCell: (rowIndex, _column, value) =>
                rowIndex === 2
                    ? {
                          image: { id: 'a&b', base64: PNG, imageType: 'png', width: 20, height: 12, altText: 'x "y"' },
                          value,
                      }
                    : undefined,
        });
        const pic = attrs(parts.get('/xl/drawings/drawing1.xml'), 'xdr:cNvPr')[0];
        expect(pic).toBeDefined();
        expect(attr(pic, 'name')).toBe('a&amp;b');
        expect(attr(pic, 'descr')).toBe('x &quot;y&quot;');
    });

    test('headerFooterConfig with first and even rules: children follow the schema order', async () => {
        const xml = await sheetXml(oneColumn, {
            headerFooterConfig: {
                all: { header: [{ value: 'h' }], footer: [{ value: 'f' }] },
                first: { header: [{ value: 'fh' }] },
                even: { header: [{ value: 'eh' }] },
            },
        });
        const order = ['<oddHeader', '<oddFooter', '<evenHeader', '<firstHeader'].map((tag) => xml.indexOf(tag));
        expect(order.every((index) => index >= 0)).toBe(true);
        expect(order).toEqual([...order].sort((a, b) => a - b));
    });

    test('prependContent row outlineLevel above 7: the row outline level is clamped', async () => {
        const xml = await sheetXml(oneColumn, {
            prependContent: [{ cells: [{ data: { type: 'String', value: 'deep' } }], outlineLevel: 9 }],
        });
        for (const row of attrs(xml, 'row')) {
            const level = attr(row, 'outlineLevel');
            if (level !== undefined) {
                expect(Number(level)).toBeLessThanOrEqual(7);
            }
        }
    });

    /**
     * GENERALLY WARNED (excel-export-data-types: "If you try to export a value that is not compatible with the
     * underlying data type Excel will display an error when opening the file"). It would still be preferable to fix
     * it automatically (e.g. write a non-finite number as text), signal an error to the app, or put an error in the
     * downloaded file - anything but appearing to save a file that is later found unopenable.
     */
    test('Infinity under a Number style: the cell is not written as a number', async () => {
        const xml = await sheetXml(
            {
                columnDefs: [{ field: 'a', cellClass: 'num' }],
                excelStyles: [{ id: 'num', dataType: 'Number' }],
                rowData: [{ a: Infinity }],
            },
            {}
        );
        expect(xml).not.toMatch(/<v>-?Infinity<\/v>/);
    });

    /**
     * DOCUMENTED LIMITATION (excel-export-data-types: "The DateTime format only accepts dates in ISO Format").
     * It would still be preferable to fix it automatically (e.g. serialise a Date object to ISO 8601), signal an
     * error to the app, or put an error in the downloaded file - anything but appearing to save a file that is
     * later found unopenable.
     */
    test('Date object under a DateTime style: the value is written in ISO 8601', async () => {
        const xml = await sheetXml(
            {
                columnDefs: [{ field: 'a', cellClass: 'date' }],
                excelStyles: [{ id: 'date', dataType: 'DateTime' }],
                rowData: [{ a: new Date(2020, 0, 1) }],
            },
            {}
        );
        const value = /<c r="A2"[^>]*t="d"[^>]*>\s*<v>([^<]*)<\/v>/.exec(xml)?.[1];
        expect(value).toMatch(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/);
    });

    /**
     * GENERALLY WARNED (excel-export-data-types: "If you try to export a value that is not compatible with the
     * underlying data type Excel will display an error when opening the file"). It would still be preferable to fix
     * it automatically (e.g. write text that is not an Excel error literal as a string), signal an error to the
     * app, or put an error in the downloaded file - anything but appearing to save a file that is later found
     * unopenable.
     */
    test('arbitrary text under an Error style: the cell is not written as an invalid error literal', async () => {
        const xml = await sheetXml(
            {
                columnDefs: [{ field: 'a', cellClass: 'err' }],
                excelStyles: [{ id: 'err', dataType: 'Error' }],
                rowData: [{ a: 'oops' }],
            },
            {}
        );
        const errorCell = /<c r="A2"[^>]*t="e"[^>]*>\s*<v>([^<]*)<\/v>/.exec(xml);
        if (errorCell) {
            expect(EXCEL_ERROR_LITERALS).toContain(errorCell[1]);
        }
    });
});
