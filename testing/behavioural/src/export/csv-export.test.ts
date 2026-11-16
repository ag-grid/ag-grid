import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, CsvExportModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

describe('CSV export sanitizeFormulas', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CsvExportModule, RowGroupingModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    // [cell value, exported value with sanitizeFormulas]
    const CASES: [string, string][] = [
        ['=1+1', "'=1+1"],
        ['+A1', "'+A1"],
        ['-A1', "'-A1"],
        ['@SUM(A1)', "'@SUM(A1)"],
        ['\tvalue', "'\tvalue"],
        ['\rvalue', "'\rvalue"],
        ['\nvalue', "'\nvalue"],
        // Full-width forms, which some locales also evaluate as formulas. '－1' starts with
        // U+FF0D FULLWIDTH HYPHEN-MINUS, not the ASCII '-' of a negative number, so it is not exempt.
        ['＝1+1', "'＝1+1"],
        ['＋1', "'＋1"],
        ['－1', "'－1"],
        ['＠A1', "'＠A1"],
        // A bare sign is not a number
        ['-', "'-"],
        ['plain', 'plain'],
        ['', ''],
        // Only the first character is checked
        ['a=b', 'a=b'],
    ];
    const INPUTS = CASES.map(([input]) => input);
    const SANITIZED = CASES.map(([, sanitized]) => sanitized);

    const toQuotedCsv = (values: string[]) => values.map((v) => `"${v}"`).join('\r\n');

    function createGrid() {
        return gridsManager.createGrid('csv-sanitize-formulas', {
            columnDefs: [{ field: 'value' }],
            rowData: INPUTS.map((value) => ({ value })),
        });
    }

    test('leaves values unchanged by default', () => {
        const api = createGrid();

        expect(api.getDataAsCsv({ skipColumnHeaders: true })).toBe(toQuotedCsv(INPUTS));
    });

    test('prefixes values that start with a formula character', () => {
        const api = createGrid();

        expect(api.getDataAsCsv({ skipColumnHeaders: true, sanitizeFormulas: true })).toBe(toQuotedCsv(SANITIZED));
    });

    test('leaves plain numbers unchanged', () => {
        const api = gridsManager.createGrid('csv-sanitize-numbers', {
            // Text that is a plain number is left unchanged too, not only number cells
            columnDefs: [{ field: 'num' }, { field: 'text', cellDataType: 'text' }],
            rowData: [
                { num: -5, text: '-5' },
                { num: 1.5, text: '+1.5' },
                { num: -1000, text: '-1e3' },
                { num: -0.5, text: '-.5' },
            ],
        });

        expect(api.getDataAsCsv({ skipColumnHeaders: true, sanitizeFormulas: true })).toBe(
            [`"-5","-5"`, `"1.5","+1.5"`, `"-1000","-1e3"`, `"-0.5","-.5"`].join('\r\n')
        );
    });

    test('leaves number cells formatted with a leading sign unchanged', () => {
        const api = gridsManager.createGrid('csv-sanitize-formatted-numbers', {
            columnDefs: [
                { field: 'num', valueFormatter: () => '-1,000.50' },
                { field: 'big', valueFormatter: () => '-£5' },
                // The exemption depends on the underlying value being a number, not on how the text looks
                { field: 'text', cellDataType: 'text', valueFormatter: () => '-1,000.50' },
                // A number cell is only exempt when its formatted value starts with a sign
                { field: 'formula', valueFormatter: () => '=1+1' },
            ],
            rowData: [{ num: -1000.5, big: BigInt(-5), text: '-1000.5', formula: 1 }],
        });

        expect(api.getDataAsCsv({ skipColumnHeaders: true, sanitizeFormulas: true })).toBe(
            `"-1,000.50","-£5","'-1,000.50","'=1+1"`
        );
    });

    test('leaves average aggregates formatted with a leading sign unchanged', () => {
        const api = gridsManager.createGrid('csv-sanitize-average', {
            columnDefs: [
                { field: 'group', rowGroup: true, hide: true },
                { field: 'num', aggFunc: 'avg', valueFormatter: () => '-1,500.00' },
            ],
            rowData: [{ group: 'a', num: -1500 }],
        });

        expect(api.getDataAsCsv({ skipColumnHeaders: true, sanitizeFormulas: true })).toBe(
            [`" -> a","-1,500.00"`, `"","-1,500.00"`].join('\r\n')
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
                getCustomContentBelowRow: () => '=below',
                appendContent: '=appended',
            })
        ).toBe([`"'=prepended"`, '"a"', '=below', '=appended'].join('\r\n'));
    });

    test('applies to the result of processCellCallback', () => {
        const api = gridsManager.createGrid('csv-sanitize-callback', {
            columnDefs: [{ field: 'value' }],
            rowData: [{ value: 2 }],
        });

        expect(
            api.getDataAsCsv({
                skipColumnHeaders: true,
                sanitizeFormulas: true,
                processCellCallback: ({ value }) => `=A1*${value}`,
            })
        ).toBe(`"'=A1*2"`);
    });

    test('applies when quotes are suppressed', () => {
        const api = createGrid();

        expect(api.getDataAsCsv({ skipColumnHeaders: true, suppressQuotes: true, sanitizeFormulas: true })).toBe(
            SANITIZED.join('\r\n')
        );
    });

    test('applies to objects converted to strings when quotes are suppressed', () => {
        const api = gridsManager.createGrid('csv-sanitize-object', {
            columnDefs: [{ field: 'value', cellDataType: false }],
            rowData: [{ value: { toString: () => '=object' } }],
        });

        expect(api.getDataAsCsv({ skipColumnHeaders: true, suppressQuotes: true, sanitizeFormulas: true })).toBe(
            `'=object`
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
