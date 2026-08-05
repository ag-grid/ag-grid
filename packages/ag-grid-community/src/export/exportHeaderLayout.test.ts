import { AgColumn } from '../entities/agColumn';
import { AgColumnGroup } from '../entities/agColumnGroup';
import { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import { createExportHeaderLayout } from './exportHeaderLayout';

const createColumn = (id: string, suppressSpanHeaderHeight: boolean): AgColumn =>
    new AgColumn({ suppressSpanHeaderHeight }, null, id, true, 'user');

const createGroup = (
    id: string,
    level: number,
    padding: boolean,
    children: (AgColumn | AgColumnGroup)[]
): AgColumnGroup => {
    const providedGroup = new AgProvidedColumnGroup(null, id, padding, level);
    const group = new AgColumnGroup(providedGroup, id, 0, null);
    group.children = children;
    providedGroup.children = children.map((child) => (child.isColumn ? child : child.getProvidedColumnGroup()));
    for (const child of children) {
        if (child.isColumn) {
            child.originalParent = providedGroup;
        } else {
            child.getProvidedColumnGroup().originalParent = providedGroup;
        }
    }
    return group;
};

/** Every row must cover each column index exactly once; CSV separators rely on it. */
function expectFullTiling(rows: { cells: { columnIndex: number; columnSpan: number }[] }[], columnCount: number): void {
    for (const row of rows) {
        const coveredIndexes: number[] = [];
        for (const cell of row.cells) {
            for (let offset = 0; offset < cell.columnSpan; offset++) {
                coveredIndexes.push(cell.columnIndex + offset);
            }
        }
        coveredIndexes.sort((a, b) => a - b);
        expect(coveredIndexes).toEqual(Array.from({ length: columnCount }, (_, index) => index));
    }
}

describe('createExportHeaderLayout', () => {
    it('spans a column header through padding rows by default', () => {
        const athlete = createColumn('athlete', false);
        const country = createColumn('country', false);
        const age = createColumn('age', false);
        const athleteGroup = createGroup('athleteGroup', 0, false, [athlete, country]);
        const agePadding = createGroup('agePadding', 0, true, [age]);

        const rows = createExportHeaderLayout([athleteGroup, agePadding], [athlete, country, age], false, true, true);

        expect(rows).toHaveLength(2);
        expect(rows[0].cells).toMatchObject([
            { type: 'group', columnIndex: 0, columnSpan: 2, rowSpan: 1 },
            { type: 'column', column: age, columnIndex: 2, columnSpan: 1, rowSpan: 2 },
        ]);
        expect(rows[1].cells).toMatchObject([
            { type: 'column', column: athlete, columnIndex: 0 },
            { type: 'column', column: country, columnIndex: 1 },
            { type: 'covered', columnIndex: 2 },
        ]);
    });

    it('retains the padding cell when header height spanning is suppressed', () => {
        const athlete = createColumn('athlete', false);
        const age = createColumn('age', true);
        const athleteGroup = createGroup('athleteGroup', 0, false, [athlete]);
        const agePadding = createGroup('agePadding', 0, true, [age]);

        const rows = createExportHeaderLayout([athleteGroup, agePadding], [athlete, age], false, true, true);

        expect(rows[0].cells).toMatchObject([
            { type: 'group', columnIndex: 0 },
            { type: 'padding', column: agePadding, columnIndex: 1 },
        ]);
        expect(rows[1].cells).toMatchObject([
            { type: 'column', column: athlete, columnIndex: 0, rowSpan: 1 },
            { type: 'column', column: age, columnIndex: 1, rowSpan: 1 },
        ]);
    });

    it('keeps column headers in a single row when spanning is disabled', () => {
        const athlete = createColumn('athlete', false);
        const age = createColumn('age', false);
        const athleteGroup = createGroup('athleteGroup', 0, false, [athlete]);
        const agePadding = createGroup('agePadding', 0, true, [age]);

        const rows = createExportHeaderLayout([athleteGroup, agePadding], [athlete, age], false, true, false);

        expect(rows[0].cells).toMatchObject([
            { type: 'group', columnIndex: 0 },
            { type: 'padding', column: agePadding, columnIndex: 1 },
        ]);
        expect(rows[1].cells).toMatchObject([
            { type: 'column', column: athlete, rowSpan: 1 },
            { type: 'column', column: age, rowSpan: 1 },
        ]);
        expectFullTiling(rows, 2);
    });

    it('emits only group rows when column headers are excluded', () => {
        const athlete = createColumn('athlete', false);
        const age = createColumn('age', false);
        const athleteGroup = createGroup('athleteGroup', 0, false, [athlete]);
        const agePadding = createGroup('agePadding', 0, true, [age]);

        const rows = createExportHeaderLayout([athleteGroup, agePadding], [athlete, age], false, false, true);

        expect(rows).toHaveLength(1);
        expect(rows[0].cells).toMatchObject([
            { type: 'group', columnIndex: 0 },
            { type: 'padding', column: agePadding, columnIndex: 1 },
        ]);
        expectFullTiling(rows, 2);
    });

    it('splits a group into segments when its exported leaves are not contiguous', () => {
        const athlete = createColumn('athlete', false);
        const country = createColumn('country', false);
        const age = createColumn('age', false);
        const athleteGroup = createGroup('athleteGroup', 0, false, [athlete, country]);
        const agePadding = createGroup('agePadding', 0, true, [age]);

        // exported order interleaves the group's leaves with an unrelated column.
        const rows = createExportHeaderLayout([athleteGroup, agePadding], [athlete, age, country], false, true, false);

        expect(rows[0].cells).toMatchObject([
            { type: 'group', column: athleteGroup, columnIndex: 0, columnSpan: 1 },
            { type: 'padding', column: agePadding, columnIndex: 1, columnSpan: 1 },
            { type: 'group', column: athleteGroup, columnIndex: 2, columnSpan: 1 },
        ]);
        expectFullTiling(rows, 3);
    });

    it('keeps padding segments for leaves that suppress spanning within one group', () => {
        const athlete = createColumn('athlete', true);
        const country = createColumn('country', false);
        const padding = createGroup('padding', 0, true, [athlete, country]);

        const rows = createExportHeaderLayout([padding], [athlete, country], false, true, true);

        expect(rows[0].cells).toMatchObject([
            { type: 'padding', column: padding, columnIndex: 0, columnSpan: 1 },
            { type: 'column', column: country, columnIndex: 1, rowSpan: 2 },
        ]);
        expect(rows[1].cells).toMatchObject([
            { type: 'column', column: athlete, columnIndex: 0, rowSpan: 1 },
            { type: 'covered', columnIndex: 1 },
        ]);
        expectFullTiling(rows, 2);
    });

    it('removes trailing rows that contain only padding groups', () => {
        const athlete = createColumn('athlete', true);
        const padding = createGroup('padding', 1, true, [athlete]);
        const athleteGroup = createGroup('athleteGroup', 0, false, [padding]);

        const visiblePaddingRows = createExportHeaderLayout([athleteGroup], [athlete], false, true, true);
        const hiddenPaddingRows = createExportHeaderLayout([athleteGroup], [athlete], true, true, true);

        expect(visiblePaddingRows).toHaveLength(3);
        expect(hiddenPaddingRows).toHaveLength(2);
        expect(hiddenPaddingRows[0].cells[0]).toMatchObject({ type: 'group', column: athleteGroup });
        expect(hiddenPaddingRows[1].cells[0]).toMatchObject({ type: 'column', column: athlete });
    });
});
