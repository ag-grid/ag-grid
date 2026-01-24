import type { ExcelGridSerializingParams } from './excelSerializingSession';
import { ExcelSerializingSession } from './excelSerializingSession';
import { Workbook, createXlsxContentTypes, createXlsxCustomProperties, createXlsxRels } from './excelXlsxFactory';

const stubParams = (
    overrides: Partial<ExcelGridSerializingParams> = {},
    workbook: Workbook = new Workbook()
): ExcelGridSerializingParams => ({
    baseExcelStyles: [],
    styleLinker: () => [],
    colModel: { isPivotActive: () => false } as any,
    colNames: { getDisplayNameForColumn: () => 'A' } as any,
    valueSvc: {} as any,
    formulaSvc: {} as any,
    gos: { get: () => undefined } as any,
    rowGroupColsSvc: {} as any,
    processCellCallback: undefined,
    processHeaderCallback: undefined,
    processGroupHeaderCallback: undefined,
    processRowGroupCallback: undefined,
    headerRowCount: 0,
    pivotModeActive: false,
    workbook,
    ...overrides,
});

const basicWorksheet = (name: string, cellValue: string = '1') => ({
    name,
    table: {
        columns: [{ width: 100, displayName: 'A', filterAllowed: true }],
        rows: [{ cells: [{ data: { type: 'n' as const, value: cellValue } }] }],
    },
});

describe('excelXlsxFactory Workbook', () => {
    afterEach(() => {
        // Clear global factory state between tests.
        new Workbook().reset();
    });

    it('orders multi-sheet exports according to supplied data array', () => {
        const workbook = new Workbook();
        const sheetA = workbook.addWorksheet([], basicWorksheet('First', '1'), stubParams({}, workbook));
        const sheetB = workbook.addWorksheet([], basicWorksheet('Second', '2'), stubParams({}, workbook));

        // Export with reversed order
        workbook.syncOrderWithSheetData([sheetB, sheetA]);
        expect(workbook.getSheetNames().slice(0, 2)).toEqual(['Second', 'First']);
    });

    it('adds table relationships when exporting as Excel table', () => {
        const workbook = new Workbook();
        const worksheet = basicWorksheet('TableSheet');
        const worksheetXml = workbook.addWorksheet(
            [],
            worksheet,
            stubParams({ exportAsExcelTable: true, headerRowCount: 1 }, workbook)
        );
        expect(worksheetXml).toContain('tableParts');
        expect(worksheetXml).toContain('tablePart');
    });

    it('writes frozen panes and RTL sheet view markers', () => {
        const workbook = new Workbook();
        const worksheetXml = workbook.addWorksheet(
            [],
            basicWorksheet('Frozen'),
            stubParams({ frozenRowCount: 1, frozenColumnCount: 1, rightToLeft: true }, workbook)
        );

        expect(worksheetXml).toMatch(/rightToLeft="1"/);
        expect(worksheetXml).toMatch(/<pane\b(?=[^>]*xSplit="1")(?=[^>]*ySplit="1")(?=[^>]*topLeftCell="B2")/);
    });

    it('applies header/footer token replacements', () => {
        const workbook = new Workbook();
        const worksheetXml = workbook.addWorksheet(
            [],
            basicWorksheet('HeaderFooter'),
            stubParams(
                {
                    headerFooterConfig: {
                        all: {
                            header: [{ value: 'Page &[Page]' }],
                        },
                    },
                },
                workbook
            )
        );

        expect(worksheetXml).toMatch(/&(amp;)?P/);
    });

    it('writes sheet protection when enabled', () => {
        const workbook = new Workbook();
        const worksheetXml = workbook.addWorksheet(
            [],
            basicWorksheet('Protected'),
            stubParams({ protectSheet: true }, workbook)
        );

        expect(worksheetXml).toMatch(/<sheetProtection\b[^>]*sheet="1"/);
    });

    it('writes sheet protection settings and password hash', () => {
        const workbook = new Workbook();
        const worksheetXml = workbook.addWorksheet(
            [],
            basicWorksheet('Protected'),
            stubParams(
                {
                    protectSheet: {
                        // eslint-disable-next-line sonarjs/no-hardcoded-passwords
                        password: 'password',
                        formatCells: true,
                        selectLockedCells: false,
                    },
                },
                workbook
            )
        );

        expect(worksheetXml).toMatch(/<sheetProtection\b[^>]*password="83AF"/);
        expect(worksheetXml).toMatch(/formatCells="0"/);
        expect(worksheetXml).toMatch(/selectLockedCells="1"/);
    });

    it('adds drawing relationship when body images are present', () => {
        const workbook = new Workbook();
        const col = { getId: () => 'c1' } as any;
        const columnsToExport = [col];

        workbook.addBodyImageToMap(
            {
                id: 'img-1',
                base64: 'abc',
                imageType: 'png',
                width: 10,
                height: 10,
                position: { row: 1, column: 1 },
            },
            1,
            col,
            columnsToExport
        );

        const worksheetXml = workbook.addWorksheet([], basicWorksheet('Images'), stubParams({}, workbook));

        expect(worksheetXml).toContain('<drawing');
    });
});

describe('excelXlsxFactory custom metadata', () => {
    afterEach(() => {
        new Workbook().reset();
    });

    it('writes custom properties using stringified values', () => {
        const xml = createXlsxCustomProperties({
            'MSIP_Label_8f3c2a91-bd44-4e6a-9d7c-5e3b9c2f1a84_Enabled': true,
            'MSIP_Label_8f3c2a91-bd44-4e6a-9d7c-5e3b9c2f1a84_SetDate': '2026-01-01T12:00:00Z',
            'MSIP_Label_8f3c2a91-bd44-4e6a-9d7c-5e3b9c2f1a84_Method': 'Privileged',
            'MSIP_Label_8f3c2a91-bd44-4e6a-9d7c-5e3b9c2f1a84_Name': 'Confidential',
            'MSIP_Label_8f3c2a91-bd44-4e6a-9d7c-5e3b9c2f1a84_SiteId': '2c6d7f14-91e8-4a2f-b0b5-9c1d3e4f6a72',
            'MSIP_Label_8f3c2a91-bd44-4e6a-9d7c-5e3b9c2f1a84_ActionId': 'a17d9c6b-43f5-4c82-9a8e-6b2f1e3c9d40',
            'MSIP_Label_8f3c2a91-bd44-4e6a-9d7c-5e3b9c2f1a84_ContentBits': 2,
        });

        expect(xml).toContain('custom-properties');
        expect(xml).toContain('MSIP_Label_8f3c2a91-bd44-4e6a-9d7c-5e3b9c2f1a84_Enabled');
        expect(xml).toContain('<vt:lpwstr>true</vt:lpwstr>');
        expect(xml).toContain('<vt:lpwstr>2026-01-01T12:00:00Z</vt:lpwstr>');
        expect(xml).toContain('<vt:lpwstr>Confidential</vt:lpwstr>');
        expect(xml).toContain('<vt:lpwstr>2c6d7f14-91e8-4a2f-b0b5-9c1d3e4f6a72</vt:lpwstr>');
        expect(xml).toContain('<vt:lpwstr>a17d9c6b-43f5-4c82-9a8e-6b2f1e3c9d40</vt:lpwstr>');
        expect(xml).toContain('<vt:lpwstr>2</vt:lpwstr>');
    });

    it('adds custom properties parts to rels and content types', () => {
        const rels = createXlsxRels(true);
        const contentTypes = createXlsxContentTypes(1, true);

        expect(rels).toContain('custom-properties');
        expect(contentTypes).toContain('custom-properties');
        expect(contentTypes).toContain('/docProps/custom.xml');
    });
});

describe('excel styles', () => {
    const workbookStub: Workbook = {
        getStringPosition: (() => {
            const map = new Map<string, number>();
            return (str: string) => {
                if (!map.has(str)) {
                    map.set(str, map.size);
                }
                return map.get(str)!;
            };
        })(),
        addBodyImageToMap: () => {},
        addHeaderFooterImageToMap: () => {},
        addWorksheet: () => '',
        syncOrderWithSheetData: () => {},
        reset: () => {},
        setFactoryMode: () => {},
        getFactoryMode: () => 'SINGLE_SHEET',
        getSheetNames: () => [],
    } as Workbook;

    const baseStyles = [
        { id: 'cell', alignment: { vertical: 'Center' as const } },
        { id: 'redFont', font: { color: '#ff0000' } },
        {
            id: 'greenBackground',
            alignment: { horizontal: 'Right' as const, vertical: 'Bottom' as const },
            font: { color: '#e0ffc1' },
            interior: { color: '#008000', pattern: 'Solid' as const },
        },
    ];

    it('merges multiple excelStyles in order (later styles override earlier)', () => {
        const session = new ExcelSerializingSession(
            stubParams(
                {
                    baseExcelStyles: baseStyles,
                    styleLinker: () => ['cell', 'redFont', 'greenBackground'],
                },
                workbookStub
            )
        );

        const colStub = {
            getActualWidth: () => 100,
            isFilterAllowed: () => false,
            getDefinition: () => ({}),
            getColSpan: () => 1,
            isAllowFormula: () => false,
        } as any;
        session.prepare([colStub]);

        session.addCustomContent([
            {
                cells: [{ data: { type: 's', value: 'v' }, styleId: ['cell', 'redFont', 'greenBackground'] }],
            },
        ]);

        const excelStyles = (session as any).excelStyles;
        const merged = excelStyles.find((s) => s.id?.startsWith('mixedStyle'));

        expect(merged).toBeDefined();
        expect(merged!.font!.color).toBe('#e0ffc1'); // greenBackground overrides redFont
        expect(merged!.alignment!.horizontal).toBe('Right');
        expect(merged!.alignment!.vertical).toBe('Bottom'); // override base "cell"
        expect(merged!.interior!.color).toBe('#008000');
    });

    it('retains base style when only one excelStyle is applied', () => {
        const session = new ExcelSerializingSession(
            stubParams(
                {
                    baseExcelStyles: baseStyles,
                    styleLinker: () => ['redFont'],
                },
                workbookStub
            )
        );

        const colStub = {
            getActualWidth: () => 100,
            isFilterAllowed: () => false,
            getDefinition: () => ({}),
            getColSpan: () => 1,
            isAllowFormula: () => false,
        } as any;
        session.prepare([colStub]);

        session.addCustomContent([
            {
                cells: [{ data: { type: 's', value: 'v' }, styleId: ['redFont'] }],
            },
        ]);

        const excelStyles = (session as any).excelStyles;
        const red = excelStyles.find((s) => s.id === 'redFont');

        expect(red).toBeDefined();
        expect(red!.font!.color).toBe('#ff0000');
        expect(excelStyles.some((s) => s.id?.startsWith('mixedStyle'))).toBe(false);
    });

    it('applies header and headerGroup styles to headers', () => {
        const headerStyles = [
            { id: 'header', alignment: { vertical: 'Center' as const }, font: { color: '#111111' } },
            { id: 'headerGroup', font: { bold: true } },
        ];

        const session = new ExcelSerializingSession(
            stubParams(
                {
                    baseExcelStyles: headerStyles,
                    styleLinker: (p) => {
                        if (p.rowType === 'HEADER_GROUPING') {
                            return ['header', 'headerGroup'];
                        }
                        if (p.rowType === 'HEADER') {
                            return ['header'];
                        }
                        return ['cell'];
                    },
                },
                workbookStub
            )
        );

        const colStub = {
            getActualWidth: () => 100,
            isFilterAllowed: () => false,
            getDefinition: () => ({ headerClass: 'customHeader' }),
            getColSpan: () => 1,
            isAllowFormula: () => false,
            getColId: () => 'c1',
        } as any;
        session.prepare([colStub]);

        // Trigger header rows
        session.onNewHeaderGroupingRow().onColumn({} as any, 'Group', 0, 1, []);
        session.onNewHeaderRow().onColumn(colStub, 0, {} as any);

        const rows = (session as any).rows as any[];
        expect(rows[0].cells[0].styleId).toContain('mixedStyle'); // merged header + headerGroup
        expect(rows[1].cells[0].styleId).toBe('header'); // plain header style
    });

    it('adds quote prefix style when value starts with apostrophe', () => {
        const session = new ExcelSerializingSession(
            stubParams(
                {
                    baseExcelStyles: baseStyles as any,
                    styleLinker: () => ['cell', 'redFont'],
                },
                workbookStub
            )
        );
        const colStub = {
            getActualWidth: () => 100,
            isFilterAllowed: () => false,
            getDefinition: () => ({}),
            getColSpan: () => 1,
            isAllowFormula: () => false,
        } as any;
        session.prepare([colStub]);

        session.addCustomContent([
            {
                cells: [{ data: { type: 's', value: "'text" }, styleId: ['cell', 'redFont'] }],
            },
        ]);

        const excelStyles = (session as any).excelStyles as any[];
        const quoteStyle = excelStyles.find((s) => s.id === '_quotePrefix');
        expect(quoteStyle).toBeDefined();
    });

    it('skips Excel table when exportAsExcelTable is true but pivot mode is active', () => {
        const workbook = new Workbook();
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const worksheetXml = workbook.addWorksheet(
            [],
            basicWorksheet('TableSkip'),
            stubParams({ exportAsExcelTable: true, headerRowCount: 1, pivotModeActive: true }, workbook)
        );

        // When table is skipped, there should be no tableParts rel
        expect(worksheetXml).not.toContain('tableParts');
        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
    });
});
