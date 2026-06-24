import { getByTestId } from '@testing-library/dom';

import { CellStyleModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';

import { GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('Cell Custom Styles', () => {
    const gridMgr = new TestGridsManager({
        modules: [CellStyleModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('cellClass applies static classes from string, array and function', async () => {
        const api = await gridMgr.createGridAndWait('cellClassGrid', {
            columnDefs: [
                { field: 'str', cellClass: 'class-from-string' },
                { field: 'arr', cellClass: ['class-a', 'class-b'] },
                { field: 'fn', cellClass: (params) => (params.value >= 50 ? 'high' : 'low') },
            ],
            rowData: [
                { id: 'ROW_0', str: 'x', arr: 'y', fn: 80 },
                { id: 'ROW_1', str: 'x', arr: 'y', fn: 10 },
            ],
            getRowId: (params) => params.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(0); // flush the debounced test-id assignment

        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'str'))).toHaveClass('class-from-string');
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'arr'))).toHaveClass('class-a', 'class-b');

        // function evaluated per row with the cell value
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'fn'))).toHaveClass('high');
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'fn'))).not.toHaveClass('low');
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'fn'))).toHaveClass('low');
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'fn'))).not.toHaveClass('high');
    });

    test('cellStyle applies inline styles from object and function', async () => {
        const api = await gridMgr.createGridAndWait('cellStyleGrid', {
            columnDefs: [
                { field: 'obj', cellStyle: { backgroundColor: 'rgb(0, 0, 255)' } },
                {
                    field: 'fn',
                    cellStyle: (params) =>
                        params.value >= 50 ? { color: 'rgb(255, 0, 0)' } : { color: 'rgb(0, 128, 0)' },
                },
            ],
            rowData: [
                { id: 'ROW_0', obj: 'x', fn: 80 },
                { id: 'ROW_1', obj: 'x', fn: 10 },
            ],
            getRowId: (params) => params.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(0); // flush the debounced test-id assignment

        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'obj'))).toHaveStyle({
            backgroundColor: 'rgb(0, 0, 255)',
        });
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'fn'))).toHaveStyle({ color: 'rgb(255, 0, 0)' });
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'fn'))).toHaveStyle({ color: 'rgb(0, 128, 0)' });
    });

    test('cellClassRules adds the class when the rule becomes true and removes it when it becomes false', async () => {
        const api = await gridMgr.createGridAndWait('cellClassRulesGrid', {
            columnDefs: [{ field: 'score', cellClassRules: { 'score-high': (params) => params.value >= 50 } }],
            rowData: [{ id: 'ROW_0', score: 10 }],
            getRowId: (params) => params.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(0); // flush the debounced test-id assignment

        // rule is false initially — class not applied
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'score'))).not.toHaveClass('score-high');

        // raise the value above the threshold — rule becomes true
        api.applyTransaction({ update: [{ id: 'ROW_0', score: 80 }] });
        await asyncSetTimeout(0);

        await new GridRows(api, 'after raising score above threshold').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ROW_0 score:80
        `);
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'score'))).toHaveClass('score-high');

        // lower it back below the threshold — rule becomes false, class must be removed
        api.applyTransaction({ update: [{ id: 'ROW_0', score: 20 }] });
        await asyncSetTimeout(0);

        await new GridRows(api, 'after lowering score below threshold').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ROW_0 score:20
        `);
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'score'))).not.toHaveClass('score-high');
    });

    test('updating data re-evaluates a value-dependent cellClass, removing the stale static class', async () => {
        const api = await gridMgr.createGridAndWait('staticClassDiffGrid', {
            columnDefs: [
                { field: 'a', cellClass: (params) => (params.value === 'CHANGED' ? 'is-changed' : 'is-original') },
            ],
            rowData: [{ id: 'ROW_0', a: 'original' }],
            getRowId: (params) => params.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(0); // flush the debounced test-id assignment

        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'))).toHaveClass('is-original');
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'))).not.toHaveClass('is-changed');

        // change the value so the cellClass function returns a different class
        api.applyTransaction({ update: [{ id: 'ROW_0', a: 'CHANGED' }] });
        await asyncSetTimeout(0);

        // the previously-applied static class must be removed, not just the new one added
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'))).toHaveClass('is-changed');
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'))).not.toHaveClass('is-original');
    });
});
