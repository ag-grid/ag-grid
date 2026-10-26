import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, CsvExportModule } from 'ag-grid-community';

describe('CSV export sanitizeFormulas', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, CsvExportModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    const VALUES = ['=1+1', '+A1', '-A1', '@SUM(A1)', '\tvalue', '\rvalue', '-', 'plain', '', 'a=b'];

    function createGrid() {
        return gridsManager.createGrid('csv-sanitize-formulas', {
            columnDefs: [{ field: 'value' }],
            rowData: VALUES.map((value) => ({ value })),
        });
    }

    test('leaves values unchanged by default', () => {
        const api = createGrid();

        expect(api.getDataAsCsv({ skipColumnHeaders: true })).toBe(VALUES.map((v) => `"${v}"`).join('\r\n'));
    });

    test('prefixes values that start with a formula character', () => {
        const api = createGrid();

        expect(api.getDataAsCsv({ skipColumnHeaders: true, sanitizeFormulas: true })).toBe(
            [
                `"'=1+1"`,
                `"'+A1"`,
                `"'-A1"`,
                `"'@SUM(A1)"`,
                `"'\tvalue"`,
                `"'\rvalue"`,
                `"'-"`,
                '"plain"',
                '""',
                '"a=b"',
            ].join('\r\n')
        );
    });

    test('leaves plain numbers unchanged', () => {
        const api = gridsManager.createGrid('csv-sanitize-numbers', {
            columnDefs: [
                { field: 'num' },
                { field: 'text', cellDataType: 'text' },
                { field: 'formatted', valueFormatter: ({ value }) => `-$${value}` },
            ],
            rowData: [
                { num: -5, text: '-5', formatted: 5 },
                { num: 1.5, text: '+1.5', formatted: 5 },
                { num: -1000, text: '-1e3', formatted: 5 },
                { num: -0.5, text: '-.5', formatted: 5 },
            ],
        });

        expect(api.getDataAsCsv({ skipColumnHeaders: true, sanitizeFormulas: true })).toBe(
            [`"-5","-5","'-$5"`, `"1.5","+1.5","'-$5"`, `"-1000","-1e3","'-$5"`, `"-0.5","-.5","'-$5"`].join('\r\n')
        );
    });

    test('applies to header names and quotes inside the value', () => {
        const api = gridsManager.createGrid('csv-sanitize-headers', {
            columnDefs: [
                { headerName: '=Group', children: [{ field: 'value', headerName: '@Header' }] },
                { field: 'other', headerName: 'Other' },
            ],
            rowData: [{ value: '=HYPERLINK("x")', other: 'ok' }],
        });

        expect(api.getDataAsCsv({ sanitizeFormulas: true })).toBe(
            [`"'=Group",""`, `"'@Header","Other"`, `"'=HYPERLINK(""x"")","ok"`].join('\r\n')
        );
    });

    test('applies to cell custom content but not to string custom content', () => {
        const api = gridsManager.createGrid('csv-sanitize-custom-content', {
            columnDefs: [{ field: 'value' }],
            rowData: [{ value: 'a' }],
        });

        expect(
            api.getDataAsCsv({
                skipColumnHeaders: true,
                sanitizeFormulas: true,
                prependContent: [[{ data: { value: '=prepended' } }]],
                appendContent: '=appended',
            })
        ).toBe([`"'=prepended"`, '"a"', '=appended'].join('\r\n'));
    });

    test('applies when quotes are suppressed', () => {
        const api = createGrid();

        expect(api.getDataAsCsv({ skipColumnHeaders: true, suppressQuotes: true, sanitizeFormulas: true })).toBe(
            [`'=1+1`, `'+A1`, `'-A1`, `'@SUM(A1)`, `'\tvalue`, `'\rvalue`, `'-`, 'plain', '', 'a=b'].join('\r\n')
        );
    });

    test('can be set through defaultCsvExportParams', () => {
        const api = gridsManager.createGrid('csv-sanitize-default-params', {
            columnDefs: [{ field: 'value' }],
            rowData: [{ value: '=1+1' }],
            defaultCsvExportParams: { sanitizeFormulas: true },
        });

        expect(api.getDataAsCsv({ skipColumnHeaders: true })).toBe(`"'=1+1"`);
    });
});
