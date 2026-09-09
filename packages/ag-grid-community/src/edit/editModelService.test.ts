import type { BeanCollection } from '../context/context';
import type { RowNode } from '../entities/rowNode';
import type { Column } from '../interfaces/iColumn';
import type { EditPosition } from '../interfaces/iEditService';
import type { IRowNode } from '../interfaces/iRowNode';
import { EditModelService } from './editModelService';

describe('EditModelService', () => {
    let editModelService: EditModelService;

    let rowNode1: RowNode;
    let rowNode2: RowNode;

    let column1: Column;
    let column2: Column;

    let position1: Required<EditPosition>;
    let position2: Required<EditPosition>;

    beforeEach(() => {
        editModelService = new EditModelService();
        editModelService['beans'] = {} as BeanCollection;

        rowNode1 = {} as RowNode;
        rowNode2 = {} as RowNode;

        column1 = {} as Column;
        column2 = {} as Column;

        position1 = { rowNode: rowNode1, column: column1 };
        position2 = { rowNode: rowNode2, column: column2 };
    });

    it('should create an instance', () => {
        expect(editModelService).toBeTruthy();
    });

    describe('getEditPositions', () => {
        it('when empty', () => {
            const positions = editModelService.getEditPositions();
            expect(positions).toEqual([]);
        });

        it('when it has positions', () => {
            editModelService.setEdit(position1, { editorValue: 'value1' });
            editModelService.setEdit(position2, { editorValue: 'value2' });
            const positions = editModelService.getEditPositions();
            expect(positions).toEqual([
                { rowNode: rowNode1, column: column1, editorValue: 'value1' },
                { rowNode: rowNode2, column: column2, editorValue: 'value2' },
            ]);
        });

        it('when positions are removed', () => {
            editModelService.setEdit(position1, { editorValue: 'value1' });
            editModelService.setEdit(position2, { editorValue: 'value2' });
            editModelService.removeEdits(position1);
            const positions = editModelService.getEditPositions();
            expect(positions).toEqual([{ rowNode: rowNode2, column: column2, editorValue: 'value2' }]);
        });
    });

    describe('getEditMap', () => {
        it('when empty', () => {
            expect(editModelService.getEditMap()).toEqual(new Map());
        });

        it('returns the live map by reference (no copy)', () => {
            editModelService.setEdit(position1, { editorValue: 'value1' });
            expect(editModelService.getEditMap()).toBe(editModelService.getEditMap());
        });
    });

    describe('getEditMapCopy', () => {
        it('when empty', () => {
            const editMap = editModelService.getEditMapCopy();
            expect(editMap).toEqual(new Map());
        });

        it('when it has positions', () => {
            editModelService.setEdit(position1, { editorValue: 'value1' });
            editModelService.setEdit(position2, { editorValue: 'value2' });
            const editMap = editModelService.getEditMapCopy();
            expect(editMap).toEqual(
                createExpectedMap([
                    [position1, { editorValue: 'value1' }],
                    [position2, { editorValue: 'value2' }],
                ])
            );
        });

        it('when positions are removed', () => {
            editModelService.setEdit(position1, { editorValue: 'value1' });
            editModelService.setEdit(position2, { editorValue: 'value2' });
            editModelService.removeEdits(position1);
            const editMap = editModelService.getEditMapCopy();
            const expected = createExpectedMap([[position1, { editorValue: 'value2' }]]);
            expect(editMap).toEqual(expected);
        });

        it('creates an actual copy of the deepest object', () => {
            editModelService.setEdit(position1, { editorValue: 'value1' });
            editModelService.setEdit(position2, { editorValue: 'value2' });
            const editMap = editModelService.getEditMapCopy();
            const copy = editModelService.getEditMapCopy();
            expect(copy).toEqual(editMap);
            expect(copy).not.toBe(editMap);
            expect(copy.get(rowNode1)).not.toBe(editMap.get(rowNode1));
            expect(copy.get(rowNode1)!.get(column1)).not.toBe(editMap.get(rowNode1)!.get(column1));
        });
    });

    // hasOpenEditors is backed by a live `editingCount` maintained at every mutation site; these
    // pin that the count stays in sync with the `state` field (its source of truth) across each path.
    describe('hasOpenEditors', () => {
        it('is false when empty', () => {
            expect(editModelService.hasOpenEditors()).toBe(false);
        });

        it('tracks setEdit transitions into and out of the editing state', () => {
            editModelService.setEdit(position1, { state: 'changed' });
            expect(editModelService.hasOpenEditors()).toBe(false);

            editModelService.setEdit(position1, { state: 'editing' });
            expect(editModelService.hasOpenEditors()).toBe(true);

            // Re-writing an already-editing cell must not double-count.
            editModelService.setEdit(position1, { editorValue: 'typing' });
            expect(editModelService.hasOpenEditors()).toBe(true);

            editModelService.setEdit(position1, { state: 'changed' });
            expect(editModelService.hasOpenEditors()).toBe(false);
        });

        it('stays open until the last editing cell leaves the editing state', () => {
            editModelService.setEdit(position1, { state: 'editing' });
            editModelService.setEdit(position2, { state: 'editing' });
            expect(editModelService.hasOpenEditors()).toBe(true);

            editModelService.setEdit(position1, { state: 'changed' });
            expect(editModelService.hasOpenEditors()).toBe(true);

            editModelService.setEdit(position2, { state: 'changed' });
            expect(editModelService.hasOpenEditors()).toBe(false);
        });

        it('decrements when an editing cell is removed by column', () => {
            editModelService.setEdit(position1, { state: 'editing' });
            editModelService.removeEdits(position1);
            expect(editModelService.hasOpenEditors()).toBe(false);
        });

        it('decrements every editing cell when a whole row is removed', () => {
            const positionSameRow: Required<EditPosition> = { rowNode: rowNode1, column: column2 };
            editModelService.setEdit(position1, { state: 'editing' });
            editModelService.setEdit(positionSameRow, { state: 'editing' });
            editModelService.removeEdits({ rowNode: rowNode1 });
            expect(editModelService.hasOpenEditors()).toBe(false);
        });

        it('decrements when clearEditValue reverts an editing cell to changed', () => {
            editModelService.setEdit(position1, { state: 'editing' });
            editModelService.clearEditValue(position1);
            expect(editModelService.hasOpenEditors()).toBe(false);
        });

        it('recomputes the count from scratch on setEditMap', () => {
            const map = new Map([
                [rowNode1, new Map([[column1, { state: 'editing' } as any]])],
                [rowNode2, new Map([[column2, { state: 'changed' } as any]])],
            ]);
            editModelService.setEditMap(map);
            expect(editModelService.hasOpenEditors()).toBe(true);

            editModelService.setEditMap(new Map());
            expect(editModelService.hasOpenEditors()).toBe(false);
        });

        it('resets the count on clear', () => {
            editModelService.setEdit(position1, { state: 'editing' });
            editModelService.clear();
            expect(editModelService.hasOpenEditors()).toBe(false);
        });
    });

    describe('setEditMap', () => {
        // getEditMap returns the live map, so setEditMap(getEditMap()) aliases its own source.
        it('preserves edits (and editingCount) when passed the live map from getEditMap', () => {
            editModelService.setEdit(position1, { editorValue: 'value1', state: 'editing' });
            editModelService.setEdit(position2, { editorValue: 'value2', state: 'changed' });

            editModelService.setEditMap(editModelService.getEditMap()!);

            expect(editModelService.getEditMapCopy()).toEqual(
                createExpectedMap([
                    [position1, { editorValue: 'value1', state: 'editing' } as any],
                    [position2, { editorValue: 'value2', state: 'changed' } as any],
                ])
            );
            expect(editModelService.hasOpenEditors()).toBe(true);
        });
    });

    describe('cell validation map', () => {
        it('snapshots error messages supplied by validators', () => {
            const errorMessages = ['first'];
            const validationModel = editModelService.getCellValidationModel();
            validationModel.setCellValidation(position1, { errorMessages });

            errorMessages[0] = 'second';

            expect(validationModel.getCellValidation(position1)?.errorMessages).toEqual(['first']);
        });

        it('drops an emptied row so size and hasCellValidation stay accurate', () => {
            const positionSameRow: Required<EditPosition> = { rowNode: rowNode1, column: column2 };
            const validationModel = editModelService.getCellValidationModel();
            validationModel.setCellValidation(position1, { errorMessages: ['bad'] });
            validationModel.setCellValidation(positionSameRow, { errorMessages: ['bad'] });
            expect(validationModel.getCellValidationMap().size).toBe(1);

            validationModel.clearCellValidation(position1);
            expect(validationModel.hasCellValidation()).toBe(true);
            expect(validationModel.hasCellValidation({ rowNode: rowNode1 })).toBe(true);
            expect(validationModel.hasCellValidation(position1)).toBe(false);
            expect(validationModel.getCellValidationMap().size).toBe(1);

            validationModel.clearCellValidation(positionSameRow);
            expect(validationModel.hasCellValidation()).toBe(false);
            expect(validationModel.hasCellValidation({ rowNode: rowNode1 })).toBe(false);
            expect(validationModel.getCellValidationMap().size).toBe(0);
        });
    });

    describe('row validation map', () => {
        it('snapshots error messages supplied by validators', () => {
            const errorMessages = ['first'];
            const validationModel = editModelService.getRowValidationModel();
            validationModel.setRowValidation({ rowNode: rowNode1 }, { errorMessages });

            errorMessages[0] = 'second';

            expect(validationModel.getRowValidation({ rowNode: rowNode1 })?.errorMessages).toEqual(['first']);
        });
    });

    describe('start', () => {
        // findNextCellToFocusOn suspends the model while it may initialise editors (see singleCellEditStrategy),
        // so start() can run for a row that already has editing entries while suspended.
        it('keeps existing editing entries and editingCount in sync when suspended', () => {
            editModelService['beans'] = { valueSvc: { getValueFromData: () => 'src' } } as any;

            editModelService.setEdit(position1, { state: 'editing' }); // rowNode1 / column1
            editModelService.suspend(true);
            editModelService.start({ rowNode: rowNode1, column: column2 }); // same row, new editing cell
            editModelService.suspend(false);

            const row = editModelService.getEditMapCopy().get(rowNode1)!;
            expect(row.has(column1)).toBe(true); // pre-existing editing entry not dropped
            expect(row.has(column2)).toBe(true);

            // editingCount tracks both, so removing them both returns hasOpenEditors to false (no stuck count).
            editModelService.removeEdits({ rowNode: rowNode1, column: column1 });
            expect(editModelService.hasOpenEditors()).toBe(true);
            editModelService.removeEdits({ rowNode: rowNode1, column: column2 });
            expect(editModelService.hasOpenEditors()).toBe(false);
        });
    });
});

function createExpectedMap(arg0: [Required<EditPosition>, { editorValue: string }][]) {
    const map = new Map<IRowNode, Map<Column, { editorValue: string }>>();
    for (const [position, value] of arg0) {
        const colMap = map.get(position.rowNode) || new Map();
        colMap.set(position.column, value);
        map.set(position.rowNode, colMap);
    }
    return map;
}
