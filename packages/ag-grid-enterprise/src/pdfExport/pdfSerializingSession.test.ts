import type { AgColumn, RowNode } from 'ag-grid-community';

import type { PdfRow } from './pdfSerializingSession';
import { PdfSerializingSession } from './pdfSerializingSession';

const createColumn = (value: string, colSpan: number): AgColumn =>
    ({
        __value: value,
        getColSpan: () => colSpan,
    }) as any;

const createSession = (): PdfSerializingSession => {
    const session = new PdfSerializingSession({
        colModel: { pivotMode: false },
        colNames: {},
        valueSvc: {},
        gos: {
            get: () => false,
            getCallback: () => undefined,
        },
        skipStyleCallbacks: true,
    } as any);

    (session as any).extractRowCellValue = ({ column }: { column: AgColumn }) => ({
        value: (column as any).__value,
    });
    (session as any).isRowGroupCell = () => false;

    return session;
};

describe('PdfSerializingSession', () => {
    it('clamps cell spans to the remaining exported columns', () => {
        const session = createSession();
        const columns = [createColumn('A', 10), createColumn('B', 1), createColumn('C', 1)];
        const node = { data: {}, group: false, rowIndex: 0 } as RowNode;

        session.prepare(columns);

        const rowAccumulator = session.onNewBodyRow(node);
        let columnIndex = 0;
        for (const column of columns) {
            rowAccumulator.onColumn(column, columnIndex, node);
            columnIndex += 1;
        }

        const rows = (session as any).rows as PdfRow[];

        expect(rows[0].cells).toHaveLength(1);
        expect(rows[0].cells[0].mergeAcross).toBe(2);
    });
});
