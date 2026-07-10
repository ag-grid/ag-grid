import type { ExcelStyle } from 'ag-grid-community';

import type { ExcelGridSerializingParams } from './excelSerializingSession';
import { ExcelSerializingSession } from './excelSerializingSession';
import {
    Workbook,
    createXlsxComments,
    createXlsxContentTypes,
    createXlsxCustomProperties,
    createXlsxNoteVmlDrawing,
    createXlsxRelationships,
    createXlsxRels,
} from './excelXlsxFactory';

const stubParams = (
    overrides: Partial<ExcelGridSerializingParams> = {},
    workbook: Workbook = new Workbook()
): ExcelGridSerializingParams => ({
    baseExcelStyles: [],
    styleLinker: () => [],
    colModel: { isPivotActive: () => false, isPivotMode: () => false } as any,
    colNames: { getDisplayNameForColumn: () => 'A' } as any,
    valueSvc: {
        getValueForDisplay: () => ({ value: '' }),
        getDisplayValue: () => '',
        getValue: () => '',
        parseValue: () => '',
        formatValue: () => '',
    } as any,
    formulaSvc: {} as any,
    gos: { get: () => undefined, addCommon: (p: any) => p } as any,
    log: { warn: () => {}, error: () => {}, deprecated: () => {} } as any,
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

const createColumnStub = (colId: string, overrides: Record<string, any> = {}) =>
    ({
        getActualWidth: () => 100,
        isFilterAllowed: () => false,
        getDefinition: () => ({}),
        colDef: {},
        getColSpan: () => 1,
        getPinned: () => null,
        isAllowFormula: () => false,
        getColId: () => colId,
        ...overrides,
    }) as any;

const rowValueServiceStub = () =>
    ({
        getValueForDisplay: ({ column, node, includeValueFormatted }: any) => {
            const value = node?.data?.[column.getColId()];

            if (includeValueFormatted) {
                return { value, valueFormatted: value };
            }

            return { value };
        },
        getDisplayValue: (column: any, node: any) => node?.data?.[column.getColId()],
        getValue: (column: any, node: any) => node?.data?.[column.getColId()],
        parseValue: (_column: any, _node: any, valueToParse: any) => valueToParse,
        formatValue: (_column: any, _node: any, valueToFormat: any) => valueToFormat,
    }) as any;

const noteServiceStub = (note?: { text: string; author?: string }) =>
    ({
        hasDataSource: () => true,
        getNote: () => note,
    }) as any;

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

    it('maps non-empty strings to shared string indices', () => {
        const workbook = new Workbook();
        const session = new ExcelSerializingSession(
            stubParams(
                {
                    baseExcelStyles: [{ id: 'cell' }] as any,
                    styleLinker: () => ['cell'],
                },
                workbook
            )
        );

        const colStub = createColumnStub('c1');
        session.prepare([colStub]);

        session.addCustomContent([
            {
                cells: [{ data: { type: 's', value: 'Hello' }, styleId: 'cell' }],
            },
        ]);

        const worksheetXml = session.parse();

        // Shared string cells must have a numeric `<v>` index.
        expect(worksheetXml).toMatch(/t="s"[^>]*>\s*<v>0<\/v>/);
        expect(worksheetXml).not.toMatch(/t="s"[^>]*>\s*<v>\s*<\/v>/);
    });

    it('exports custom-content empty strings as blank cells', () => {
        const workbook = new Workbook();
        const session = new ExcelSerializingSession(
            stubParams(
                {
                    baseExcelStyles: [{ id: 'cell' }] as any,
                    styleLinker: () => ['cell'],
                },
                workbook
            )
        );

        const colStub = createColumnStub('c1');
        session.prepare([colStub]);

        session.addCustomContent([
            {
                cells: [{ data: { type: 's', value: '' }, styleId: 'cell' }],
            },
        ]);

        const worksheetXml = session.parse();

        expect(worksheetXml).toContain('<c r="A1" s="1"/>');
        expect(worksheetXml).not.toContain('t="s"');
        expect(worksheetXml).not.toMatch(/<v>\s*<\/v>/);
    });

    it('exports empty numeric cells as blank styled cells', () => {
        const workbook = new Workbook();
        const session = new ExcelSerializingSession(
            stubParams(
                {
                    baseExcelStyles: [{ id: 'numeric', dataType: 'Number' }] as any,
                },
                workbook
            )
        );

        const colStub = createColumnStub('c1');
        session.prepare([colStub]);

        session.addCustomContent([
            {
                cells: [{ data: { value: '' } as any, styleId: 'numeric' }],
            },
        ]);

        const worksheetXml = session.parse();

        expect(worksheetXml).toContain('<c r="A1" s="1"/>');
        expect(worksheetXml).not.toContain('t="n"');
        expect(worksheetXml).not.toMatch(/<v>\s*0\s*<\/v>/);
    });

    it('omits plain blank grid body cells for empty and missing values', () => {
        const workbook = new Workbook();
        const session = new ExcelSerializingSession(
            stubParams(
                {
                    colNames: { getDisplayNameForColumn: (column: any) => column.getColId() } as any,
                    valueSvc: rowValueServiceStub(),
                },
                workbook
            )
        );

        const athleteCol = createColumnStub('athlete');
        const countryCol = createColumnStub('country');
        session.prepare([athleteCol, countryCol]);

        const headerRow = session.onNewHeaderRow();
        headerRow.onColumn(athleteCol, 0, undefined as any);
        headerRow.onColumn(countryCol, 1, undefined as any);

        const rowData = [
            { athlete: 'Natalie Coughlin', country: 'United States' },
            { athlete: 'Aleksey Nemov', country: '' },
            { athlete: 'Alicia Coutts', country: 'Australia' },
            { athlete: 'Missy Franklin' },
        ];

        rowData.forEach((data) => {
            const node = { data, group: false, footer: false } as any;
            const row = session.onNewBodyRow(node);
            row.onColumn(athleteCol, 0, node);
            row.onColumn(countryCol, 1, node);
        });

        const worksheetXml = session.parse();

        expect(worksheetXml).toContain('<c r="B2" t="s">');
        expect(worksheetXml).toContain('<c r="B4" t="s">');
        expect(worksheetXml).not.toContain('<c r="B3"');
        expect(worksheetXml).not.toContain('<c r="B5"');
        expect(worksheetXml).not.toMatch(/t="s"[^>]*>\s*<v>\s*<\/v>/);
        expect(worksheetXml).not.toMatch(/t="n"[^>]*>\s*<v>\s*<\/v>/);
    });

    it('omits trailing blank cells for AG-5330 keyboard navigation semantics', () => {
        const workbook = new Workbook();
        const session = new ExcelSerializingSession(
            stubParams(
                {
                    colNames: { getDisplayNameForColumn: (column: any) => column.getColId() } as any,
                    valueSvc: rowValueServiceStub(),
                },
                workbook
            )
        );

        const athleteCol = createColumnStub('athlete');
        const ageCol = createColumnStub('age');
        const countryCol = createColumnStub('country');
        const yearCol = createColumnStub('year');
        session.prepare([athleteCol, ageCol, countryCol, yearCol]);

        const headerRow = session.onNewHeaderRow();
        headerRow.onColumn(athleteCol, 0, undefined as any);
        headerRow.onColumn(ageCol, 1, undefined as any);
        headerRow.onColumn(countryCol, 2, undefined as any);
        headerRow.onColumn(yearCol, 3, undefined as any);

        const node = { data: { athlete: 'sample' }, group: false, footer: false } as any;
        const row = session.onNewBodyRow(node);
        row.onColumn(athleteCol, 0, node);
        row.onColumn(ageCol, 1, node);
        row.onColumn(countryCol, 2, node);
        row.onColumn(yearCol, 3, node);

        const worksheetXml = session.parse();

        expect(worksheetXml).toContain('<c r="A2" t="s">');
        expect(worksheetXml).not.toContain('<c r="B2"');
        expect(worksheetXml).not.toContain('<c r="C2"');
        expect(worksheetXml).not.toContain('<c r="D2"');
    });

    it('exports blank note-only cells as comment anchors', () => {
        const workbook = new Workbook();
        const session = new ExcelSerializingSession(stubParams({}, workbook));

        const colStub = createColumnStub('c1');
        session.prepare([colStub]);

        session.addCustomContent([
            {
                cells: [{ note: { text: 'Blank note' } }],
            },
        ]);

        const worksheetXml = session.parse();

        expect(worksheetXml).toContain('<c r="A1"/>');
        expect(worksheetXml).toContain('legacyDrawing');
        expect(createXlsxComments(0, 'Workbook Author')).toContain('Blank note');
    });

    it('exports merged blank anchors as blank cells', () => {
        const workbook = new Workbook();
        const session = new ExcelSerializingSession(stubParams({}, workbook));

        const colStub = createColumnStub('c1');
        session.prepare([colStub]);

        session.addCustomContent([
            {
                cells: [{ data: { type: 's', value: '' }, mergeAcross: 1 }],
            },
        ]);

        const worksheetXml = session.parse();

        expect(worksheetXml).toContain('<c r="A1"/>');
        expect(worksheetXml).toContain('<mergeCell ref="A1:B1"/>');
        expect(worksheetXml).not.toContain('t="s"');
    });

    it('maps grid notes to Excel comments by default', () => {
        const workbook = new Workbook();
        const session = new ExcelSerializingSession(
            stubParams(
                {
                    notesSvc: noteServiceStub({ text: 'Grid note', author: 'Chris' }),
                },
                workbook
            )
        );

        const colStub = {
            getActualWidth: () => 100,
            isFilterAllowed: () => false,
            getDefinition: () => ({}),
            colDef: {},
            getColSpan: () => 1,
            getPinned: () => null,
            isAllowFormula: () => false,
            getColId: () => 'c1',
        } as any;
        session.prepare([colStub]);

        session.onNewBodyRow({ data: { value: 1 } } as any).onColumn(colStub, 0, { data: { value: 1 } } as any);

        const worksheetXml = session.parse();

        expect(worksheetXml).toContain('legacyDrawing');
        expect(createXlsxComments(0, 'Workbook Author')).toContain('Grid note');
        expect(createXlsxComments(0, 'Workbook Author')).toContain('<author>Chris</author>');
    });

    it('allows processNoteCallback to override or suppress notes', () => {
        const workbook = new Workbook();
        const session = new ExcelSerializingSession(
            stubParams(
                {
                    notesSvc: noteServiceStub({ text: 'Grid note', author: 'Chris' }),
                    processNoteCallback: (params) => {
                        if (params.accumulatedRowIndex === 2) {
                            return null;
                        }

                        return {
                            text: `${params.excelNote?.text} (exported)`,
                        };
                    },
                },
                workbook
            )
        );

        const colStub = {
            getActualWidth: () => 100,
            isFilterAllowed: () => false,
            getDefinition: () => ({}),
            colDef: {},
            getColSpan: () => 1,
            getPinned: () => null,
            isAllowFormula: () => false,
            getColId: () => 'c1',
        } as any;
        session.prepare([colStub]);

        session.onNewBodyRow({ data: { value: 1 } } as any).onColumn(colStub, 0, { data: { value: 1 } } as any);
        session.onNewBodyRow({ data: { value: 2 } } as any).onColumn(colStub, 0, { data: { value: 2 } } as any);

        session.parse();

        const commentsXml = createXlsxComments(0, 'Workbook Author');
        expect(commentsXml).toContain('Grid note (exported)');
        expect(commentsXml).not.toContain('author>Chris</author>');
        expect(commentsXml.match(/<comment /g)?.length).toBe(1);
    });

    it('allows callback note injection when automatic grid-note export is disabled', () => {
        const workbook = new Workbook();
        const session = new ExcelSerializingSession(
            stubParams(
                {
                    suppressGridNotesExport: true,
                    processNoteCallback: () => ({
                        text: 'Injected during export',
                    }),
                },
                workbook
            )
        );

        const colStub = {
            getActualWidth: () => 100,
            isFilterAllowed: () => false,
            getDefinition: () => ({}),
            colDef: {},
            getColSpan: () => 1,
            getPinned: () => null,
            isAllowFormula: () => false,
            getColId: () => 'c1',
        } as any;
        session.prepare([colStub]);

        session.onNewBodyRow({ data: { value: 1 } } as any).onColumn(colStub, 0, { data: { value: 1 } } as any);

        const worksheetXml = session.parse();

        expect(worksheetXml).toContain('legacyDrawing');
        expect(createXlsxComments(0, 'Workbook Author')).toContain('Injected during export');
    });

    it('falls back to the workbook author when a note author is not provided', () => {
        const workbook = new Workbook();
        const worksheetXml = workbook.addWorksheet(
            [],
            {
                name: 'AuthorFallback',
                table: {
                    columns: [{ width: 100, displayName: 'A', filterAllowed: true }],
                    rows: [
                        {
                            cells: [
                                {
                                    data: { type: 's', value: 'One' },
                                    note: { text: 'Needs review' },
                                },
                            ],
                        },
                    ],
                },
            },
            stubParams({}, workbook)
        );

        expect(worksheetXml).toContain('legacyDrawing');
        expect(createXlsxComments(0, 'Workbook Author')).toContain('<author>Workbook Author</author>');
        expect(createXlsxComments(0, '')).toContain('<author>AG Grid</author>');
    });

    it('exports notes for custom content cells', () => {
        const workbook = new Workbook();
        const session = new ExcelSerializingSession(stubParams({}, workbook));
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
                cells: [
                    {
                        data: { type: 'String', value: 'Cover' },
                        note: { text: 'Export-only cover note' },
                    },
                ],
            },
        ]);

        session.parse();

        expect(createXlsxComments(0, 'Workbook Author')).toContain('Export-only cover note');
    });

    it('omits bold author prefix when suppressPrependAuthorToNotes is true', () => {
        const workbook = new Workbook();
        workbook.addWorksheet(
            [],
            {
                name: 'NoPrepend',
                table: {
                    columns: [{ width: 100, displayName: 'A', filterAllowed: true }],
                    rows: [
                        {
                            cells: [
                                {
                                    data: { type: 's', value: 'One' },
                                    note: { text: 'Review this cell', author: 'Reviewer' },
                                },
                            ],
                        },
                    ],
                },
            },
            stubParams({}, workbook)
        );

        const withAuthor = createXlsxComments(0, 'Workbook Author');
        expect(withAuthor).toContain('<b/>');
        expect(withAuthor).toContain('Review this cell');

        const withoutAuthor = createXlsxComments(0, 'Workbook Author', true);
        expect(withoutAuthor).toContain('Review this cell');
        expect(withoutAuthor).not.toContain('<b/>');
    });

    it('keeps comment data aligned when sheet order is reordered', () => {
        const workbook = new Workbook();
        const sheetA = workbook.addWorksheet(
            [],
            {
                name: 'First',
                table: {
                    columns: [{ width: 100, displayName: 'A', filterAllowed: true }],
                    rows: [{ cells: [{ data: { type: 's', value: 'A' }, note: { text: 'First note' } }] }],
                },
            },
            stubParams({}, workbook)
        );
        const sheetB = workbook.addWorksheet(
            [],
            {
                name: 'Second',
                table: {
                    columns: [{ width: 100, displayName: 'A', filterAllowed: true }],
                    rows: [{ cells: [{ data: { type: 's', value: 'B' }, note: { text: 'Second note' } }] }],
                },
            },
            stubParams({}, workbook)
        );

        workbook.syncOrderWithSheetData([sheetB, sheetA]);

        expect(createXlsxComments(0, 'Workbook Author')).toContain('Second note');
        expect(createXlsxComments(1, 'Workbook Author')).toContain('First note');
    });

    it('adds note and header/footer relationships on the same worksheet', () => {
        const workbook = new Workbook();
        const worksheetXml = workbook.addWorksheet(
            [],
            {
                name: 'Combined',
                table: {
                    columns: [{ width: 100, displayName: 'A', filterAllowed: true }],
                    rows: [{ cells: [{ data: { type: 's', value: 'One' }, note: { text: 'Cell note' } }] }],
                },
            },
            stubParams(
                {
                    headerFooterConfig: {
                        all: {
                            header: [
                                {
                                    value: '&[Picture]',
                                    image: {
                                        id: 'logo',
                                        base64: 'abc',
                                        imageType: 'png',
                                        width: 20,
                                        height: 20,
                                    } as any,
                                },
                            ],
                        },
                    },
                },
                workbook
            )
        );

        expect(worksheetXml).toContain('legacyDrawing');
        expect(worksheetXml).toContain('legacyDrawingHF');
        expect(
            createXlsxRelationships({ noteVmlDrawingIndex: 0, headerFooterVmlDrawingIndex: 1, commentsIndex: 0 })
        ).toContain('relationships/comments');
        expect(createXlsxNoteVmlDrawing(0)).toContain('ObjectType="Note"');
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

        const excelStyles = (session as unknown as { excelStyles: ExcelStyle[] }).excelStyles;
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

        const excelStyles = (session as unknown as { excelStyles: ExcelStyle[] }).excelStyles;
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

        const excelStyles = (session as unknown as { excelStyles: ExcelStyle[] }).excelStyles;
        const quoteStyle = excelStyles.find((s) => s.id === '_quotePrefix');
        expect(quoteStyle).toBeDefined();
    });

    it('skips Excel table when exportAsExcelTable is true but pivot mode is active', () => {
        const workbook = new Workbook();
        const warnSpy = vi.fn();
        const worksheetXml = workbook.addWorksheet(
            [],
            basicWorksheet('TableSkip'),
            stubParams(
                {
                    exportAsExcelTable: true,
                    headerRowCount: 1,
                    pivotModeActive: true,
                    log: { warn: warnSpy } as any,
                },
                workbook
            )
        );

        // When table is skipped, there should be no tableParts rel
        expect(worksheetXml).not.toContain('tableParts');
        expect(warnSpy).toHaveBeenCalled();
    });
});
