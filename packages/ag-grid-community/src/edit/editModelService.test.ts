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
            const editMap = editModelService.getEditMap();
            expect(editMap).toEqual(new Map());
        });

        it('when it has positions', () => {
            editModelService.setEdit(position1, { editorValue: 'value1' });
            editModelService.setEdit(position2, { editorValue: 'value2' });
            const editMap = editModelService.getEditMap();
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
            const editMap = editModelService.getEditMap();
            const expected = createExpectedMap([[position1, { editorValue: 'value2' }]]);
            expect(editMap).toEqual(expected);
        });

        it('creates an actual copy of the deepest object', () => {
            editModelService.setEdit(position1, { editorValue: 'value1' });
            editModelService.setEdit(position2, { editorValue: 'value2' });
            const editMap = editModelService.getEditMap();
            const copy = editModelService.getEditMap();
            expect(copy).toEqual(editMap);
            expect(copy).not.toBe(editMap);
            expect(copy.get(rowNode1)).not.toBe(editMap.get(rowNode1));
            expect(copy.get(rowNode1)!.get(column1)).not.toBe(editMap.get(rowNode1)!.get(column1));
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
