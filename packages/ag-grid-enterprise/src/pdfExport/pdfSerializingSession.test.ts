import type {
    AgColumn,
    CellClassParams,
    CellStyle,
    PdfCustomContent,
    PdfStyleCallbackParams,
    ProcessCellForExportParams,
    RowNode,
} from 'ag-grid-community';

import type { PdfRow } from './pdfSerializingSession';
import { PdfSerializingSession } from './pdfSerializingSession';

const createColumn = (
    value: string,
    colSpan: number,
    cellStyle?: CellStyle | ((params: CellClassParams) => CellStyle | null | undefined),
    wrapText?: boolean,
    wrapHeaderText?: boolean
): AgColumn =>
    ({
        __value: value,
        getColSpan: () => colSpan,
        getColDef: () => ({ cellStyle, wrapText, wrapHeaderText }),
        isRowGroupDisplayed: () => false,
    }) as any;

const createGridOptionsService = (treeData = false) => ({
    addCommon: (params: object) => ({ ...params, api: {}, context: {} }),
    get: (key: string) => (key === 'treeData' ? treeData : undefined),
    getCallback: () => undefined,
});

const createSession = (): PdfSerializingSession => {
    const session = new PdfSerializingSession({
        colModel: { pivotMode: false },
        colNames: {},
        valueSvc: {},
        gos: {
            get: () => false,
            getCallback: () => undefined,
        },
        skipGridStyles: true,
    } as any);

    (session as any).extractRowCellValue = ({ column }: { column: AgColumn }) => ({
        value: (column as any).__value,
    });
    (session as any).isRowGroupCell = () => false;

    return session;
};

const getRows = (session: PdfSerializingSession): PdfRow[] => (session as any).rows;

describe('PdfSerializingSession', () => {
    it('clamps cell spans to the remaining exported columns', () => {
        const session = createSession();
        const columns = [createColumn('A', 10), createColumn('B', 1), createColumn('C', 1)];
        const node = { data: {}, group: false, level: 2, rowIndex: 0, rowPinned: 'top' } as RowNode;

        session.prepare(columns);

        const rowAccumulator = session.onNewBodyRow(node);
        let columnIndex = 0;
        for (const column of columns) {
            rowAccumulator.onColumn(column, columnIndex, node);
            columnIndex += 1;
        }

        const rows = getRows(session);

        expect(rows[0].cells).toHaveLength(1);
        expect(rows[0].cells[0].mergeAcross).toBe(2);
        expect(rows[0]).toMatchObject({ sourceNode: node, rowPinned: 'top', groupLevel: 2 });
        expect(rows[0].cells[0]).toMatchObject({
            elementType: 'cell',
            sourceColumn: columns[0],
            sourceNode: node,
            groupLevel: 2,
        });
    });

    it('clamps custom content spans and cells to the exported table width', () => {
        const session = createSession();
        const columns = [createColumn('A', 1), createColumn('B', 1), createColumn('C', 1)];
        const content: PdfCustomContent = [
            [{ data: { value: 'Spanning' }, mergeAcross: 100 }, { data: { value: 'Overflow' } }],
        ];

        session.prepare(columns);
        session.addCustomContent(content);

        const rows = getRows(session);
        expect(rows[0].cells).toHaveLength(1);
        expect(rows[0].cells[0]).toMatchObject({ value: 'Spanning', mergeAcross: 2, elementType: 'custom' });
    });

    it('resolves cellStyle with the original value before processing the exported value', () => {
        const callOrder: string[] = [];
        let automaticStyleValue: unknown;
        let exportCallbackValue: unknown;
        let pdfStyleValue: unknown;
        const column = createColumn('A', 1, (params) => {
            callOrder.push('cellStyle');
            automaticStyleValue = params.value;
            return { color: '#123456' };
        });
        const session = new PdfSerializingSession({
            colModel: { pivotMode: false },
            colNames: {},
            valueSvc: {
                getDisplayValue: () => 42,
            },
            gos: createGridOptionsService(),
            processCellCallback: (params: ProcessCellForExportParams) => {
                callOrder.push('processCellCallback');
                exportCallbackValue = params.value;
                return `processed ${params.value}`;
            },
            processStyleCallback: (params: PdfStyleCallbackParams) => {
                if (params.type === 'cell') {
                    callOrder.push('processStyleCallback');
                    pdfStyleValue = params.value;
                }
                return { backgroundColor: '#abcdef' };
            },
        } as any);
        const node = { data: { value: 42 }, group: false, level: 0, rowIndex: 0 } as RowNode;

        session.prepare([column]);
        session.onNewBodyRow(node).onColumn(column, 0, node);

        const cell = getRows(session)[0].cells[0];
        expect(callOrder).toEqual(['cellStyle', 'processCellCallback', 'processStyleCallback']);
        expect(automaticStyleValue).toBe(42);
        expect(exportCallbackValue).toBe(42);
        expect(pdfStyleValue).toBe('processed 42');
        expect(cell).toMatchObject({
            value: 'processed 42',
            elementType: 'cell',
            style: { color: '#123456', backgroundColor: '#abcdef' },
        });
    });

    it('retains group depth and provenance when processRowGroupCallback supplies the text', () => {
        const callbackValues: Array<{ type: string; value: unknown }> = [];
        const column = createColumn('Group', 1, (params) => {
            callbackValues.push({ type: 'cellStyle', value: params.value });
            return undefined;
        });
        (column as any).isRowGroupDisplayed = () => true;
        const session = new PdfSerializingSession({
            colModel: { pivotMode: false },
            colNames: {},
            valueSvc: {
                getDisplayValue: () => 'Raw group',
            },
            gos: createGridOptionsService(),
            processRowGroupCallback: () => 'Processed group',
            processStyleCallback: (params: PdfStyleCallbackParams) => {
                if (params.type === 'rowgroup') {
                    callbackValues.push({ type: params.type, value: params.value });
                }
                return undefined;
            },
        } as any);
        const rowGroupColumn = { colId: 'group', getColId: () => 'group' };
        const node = { data: {}, group: true, level: 2, rowGroupColumn, rowIndex: 0 } as unknown as RowNode;

        session.prepare([column]);
        session.onNewBodyRow(node).onColumn(column, 0, node);

        const row = getRows(session)[0];
        expect(callbackValues).toEqual([
            { type: 'cellStyle', value: 'Raw group' },
            { type: 'rowgroup', value: 'Processed group' },
        ]);
        expect(row).toMatchObject({ sourceNode: node, groupLevel: 2 });
        expect(row.cells[0]).toMatchObject({
            value: 'Processed group',
            elementType: 'rowgroup',
            sourceColumn: column,
            sourceNode: node,
            groupLevel: 2,
        });
    });

    it('exports the current group label without concatenating ancestor values', () => {
        const column = createColumn('Group', 1);
        (column as any).isRowGroupDisplayed = () => true;
        const session = new PdfSerializingSession({
            colModel: { pivotMode: false },
            colNames: {},
            valueSvc: {
                getValueForDisplay: () => ({ value: 'Current group', valueFormatted: 'Current group' }),
            },
            gos: createGridOptionsService(),
        } as any);
        const rowGroupColumn = { colId: 'group', getColId: () => 'group' };
        const node = {
            data: {},
            group: true,
            level: 3,
            uiLevel: 2,
            rowGroupColumn,
            rowIndex: 0,
        } as unknown as RowNode;

        session.prepare([column]);
        session.onNewBodyRow(node).onColumn(column, 0, node);

        const cell = getRows(session)[0].cells[0];
        expect(cell).toMatchObject({ value: 'Current group', elementType: 'rowgroup', groupLevel: 2 });
        expect(cell.value).not.toContain('->');
    });

    it('reports body-relative row indexes to style callbacks for nodes without a row index', () => {
        const reportedRowIndexes: number[] = [];
        const session = new PdfSerializingSession({
            colModel: { pivotMode: false },
            colNames: {},
            valueSvc: {},
            gos: {
                get: () => undefined,
                getCallback: (key: string) =>
                    key === 'getRowStyle'
                        ? (params: { rowIndex: number }) => {
                              reportedRowIndexes.push(params.rowIndex);
                              return undefined;
                          }
                        : undefined,
            },
        } as any);
        (session as any).extractHeaderValue = () => 'Header';
        (session as any).extractRowCellValue = () => ({ value: 'Value' });
        const column = createColumn('Value', 1);
        const node = { data: {}, group: false, level: 0, rowIndex: null } as unknown as RowNode;

        session.prepare([column]);
        session.onNewHeaderRow().onColumn(column, 0);
        session.onNewBodyRow(node).onColumn(column, 0, node);

        // the header row must not inflate the fallback index reported for the first body row.
        expect(reportedRowIndexes).toEqual([0]);
    });

    it('retains source columns and element types for exported headers', () => {
        const session = createSession();
        const column = createColumn('A', 1);
        const columnGroup = { getColGroupDef: () => undefined } as any;
        (session as any).extractHeaderValue = () => 'Header';

        session.onNewHeaderGroupingRow().onColumn(columnGroup, 'Group', 0, 1, []);
        session.onNewHeaderRow().onColumn(column, 0);

        const rows = getRows(session);
        expect(rows[0].cells[0]).toMatchObject({
            value: 'Group',
            elementType: 'groupheader',
            sourceColumn: columnGroup,
        });
        expect(rows[1].cells[0]).toMatchObject({
            value: 'Header',
            elementType: 'header',
            sourceColumn: column,
        });
    });

    it('maps column and header wrapping into automatic PDF styles', () => {
        const column = createColumn('Value', 1, undefined, true, false);
        const session = new PdfSerializingSession({
            colModel: { pivotMode: false },
            colNames: { getDisplayNameForColumn: () => 'Header' },
            valueSvc: {
                getValueForDisplay: () => ({ value: 'Value' }),
            },
            gos: createGridOptionsService(),
        } as any);
        const node = { data: {}, group: false, level: 0, rowIndex: 0 } as RowNode;

        session.prepare([column]);
        session.onNewHeaderRow().onColumn(column, 0);
        session.onNewBodyRow(node).onColumn(column, 0, node);

        const rows = getRows(session);
        expect(rows[0].cells[0].style).toMatchObject({ wrapText: false });
        expect(rows[1].cells[0].style).toMatchObject({ wrapText: true });
    });

    it('maps CSS white-space styles into PDF wrapping and line-break behaviour', () => {
        const columns = [
            createColumn('Normal', 1, { 'white-space': 'normal' }),
            createColumn('Breaks', 1, { 'white-space-collapse': 'preserve-breaks' }),
            createColumn('Pre-line', 1, { 'white-space': 'pre-line' }),
            createColumn('Pre-wrap', 1, { 'white-space': 'pre-wrap' }),
        ];
        const session = new PdfSerializingSession({
            colModel: { pivotMode: false },
            colNames: {},
            valueSvc: {},
            gos: createGridOptionsService(),
        } as any);
        const node = { data: {}, group: false, level: 0, rowIndex: 0 } as RowNode;
        (session as any).extractRowCellValue = ({ column }: { column: AgColumn }) => ({
            value: (column as any).__value,
        });

        session.prepare(columns);
        const accumulator = session.onNewBodyRow(node);
        for (let i = 0; i < columns.length; i++) {
            accumulator.onColumn(columns[i], i, node);
        }

        const cells = getRows(session)[0].cells;
        expect(cells[0].style).toMatchObject({ wrapText: true, preserveLineBreaks: false });
        expect(cells[1].style).toMatchObject({ preserveLineBreaks: true, preserveSpaces: false });
        expect(cells[1].style?.wrapText).toBeUndefined();
        expect(cells[2].style).toMatchObject({
            wrapText: true,
            preserveLineBreaks: true,
            preserveSpaces: false,
        });
        expect(cells[3].style).toMatchObject({
            wrapText: true,
            preserveLineBreaks: true,
            preserveSpaces: true,
        });
    });

    it('skips column wrapping styles when automatic style resolution is disabled', () => {
        const session = createSession();
        const column = createColumn('Value', 1, undefined, true, true);
        const node = { data: {}, group: false, level: 0, rowIndex: 0 } as RowNode;
        (session as any).extractHeaderValue = () => 'Header';

        session.prepare([column]);
        session.onNewHeaderRow().onColumn(column, 0);
        session.onNewBodyRow(node).onColumn(column, 0, node);

        const rows = getRows(session);
        expect(rows[0].cells[0].style).toBeUndefined();
        expect(rows[1].cells[0].style).toBeUndefined();
    });
});
