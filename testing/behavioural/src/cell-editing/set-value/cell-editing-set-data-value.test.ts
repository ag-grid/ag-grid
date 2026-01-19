import '@testing-library/jest-dom';

import { GridRows, TestGridsManager, asyncSetTimeout } from '../../test-utils';

describe('Cell Editing: setDataValue sources', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test.each(['rangeSvc', 'cellClear', 'redo', 'undo'] as const)(
        'setDataValue source %s only updates once',
        async (source) => {
            let valueSetterCalls = 0;
            const valueSetterTargets: string[] = [];
            const valueSetter = ({ data, newValue }: { data: { id: string; field: string }; newValue: string }) => {
                valueSetterCalls += 1;
                valueSetterTargets.push(data.id);
                data.field = newValue;
                return true;
            };

            const api = await gridMgr.createGridAndWait(`cellEditingSetDataValue-${source}`, {
                columnDefs: [
                    {
                        field: 'field',
                        editable: true,
                        valueSetter,
                    },
                ],
                rowData: [{ id: 'ROW_0', field: 'Initial Value' }],
                getRowId: (params) => params.data.id,
            });

            const beforeRows = new GridRows(api, `before ${source} setDataValue`);
            await beforeRows.check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:ROW_0 field:"Initial Value"
            `);

            const rowNode = api.getDisplayedRowAtIndex(0);
            rowNode?.setDataValue('field', `${source}-value`, source);
            await asyncSetTimeout(0);

            const afterRows = new GridRows(api, `after ${source} setDataValue`);
            await afterRows.check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:ROW_0 field:"${source}-value"
            `);

            expect(valueSetterTargets).toEqual(['ROW_0']);
            expect(valueSetterCalls).toBe(1);
        }
    );
});
