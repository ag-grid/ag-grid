import '@testing-library/jest-dom';

import type { GridOptions } from 'ag-grid-community';
import { AllCommunityModule, ClientSideRowModelModule, setupAgTestIds } from 'ag-grid-community';
import { BatchEditModule, ClipboardModule, RowGroupingModule } from 'ag-grid-enterprise';

import {
    EditEventTracker,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    clipboardUtils,
    waitForEvent,
} from '../../test-utils';
import { expect } from '../../test-utils/matchers';
import type { ColDefInternal } from './group-edit-test-utils';

describe('Group Edit: clipboard paste', () => {
    const gridMgr = new TestGridsManager({
        modules: [AllCommunityModule, ClientSideRowModelModule, RowGroupingModule, ClipboardModule, BatchEditModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        clipboardUtils.init();
    });

    beforeEach(() => {
        clipboardUtils.init();
    });

    afterEach(() => {
        gridMgr.reset();
        clipboardUtils.reset();
    });

    test('paste updates grouped leaf once', async () => {
        const valueSetterTargets: string[] = [];
        const valueSetter = (params: any) => {
            if (params.node?.id) {
                valueSetterTargets.push(String(params.node.id));
            }
            if (params.data && params.colDef.field) {
                (params.data as Record<string, any>)[params.colDef.field] = params.newValue;
            } else if (params.node?.groupData) {
                params.node.groupData.group = params.newValue;
            }
            return true;
        };

        const gridOptions: GridOptions = {
            groupDisplayType: 'custom',
            defaultColDef: {
                cellEditor: 'agTextCellEditor',
            },
            columnDefs: [
                {
                    colId: 'group',
                    headerName: 'Group',
                    field: 'label',
                    cellRenderer: 'agGroupCellRenderer',
                    cellRendererParams: {
                        suppressCount: true,
                    },
                    editable: true,
                    groupRowEditable: true,
                    valueSetter,
                } as ColDefInternal,
                { field: 'category', rowGroup: true, hide: true },
            ],
            rowData: [
                { id: 'a-1', category: 'A', label: 'A1' },
                { id: 'a-2', category: 'A', label: 'A2' },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        };

        const api = await gridMgr.createGridAndWait('groupEditClipboardPaste', gridOptions);
        const eventTracker = new EditEventTracker(api);

        const beforeRows = new GridRows(api, 'before group paste');
        await beforeRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-category-A
            · ├── LEAF id:a-1 group:"A1" category:"A"
            · └── LEAF id:a-2 group:"A2" category:"A"
        `);

        const groupRowNode = api.getDisplayedRowAtIndex(0);
        expect(groupRowNode).toBeDefined();
        expect(groupRowNode!.group).toBe(true);

        const groupCol = api.getDisplayedCenterColumns()[0]!;
        const groupColId = groupCol.getColId();

        clipboardUtils.setText('Edited Group');
        api.setFocusedCell(groupRowNode!.rowIndex!, groupColId);
        api.startEditingCell({ rowIndex: groupRowNode!.rowIndex!, colKey: groupColId });
        await asyncSetTimeout(0);
        const pasteEnd = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasteEnd;

        const afterRows = new GridRows(api, 'after group paste');
        await afterRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-category-A
            · ├── LEAF id:a-1 group:"Edited Group" category:"A"
            · └── LEAF id:a-2 group:"A2" category:"A"
        `);
        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 1,
            cellEditingStopped: 1,
            cellValueChanged: 1,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
        });
        expect(new Set(valueSetterTargets)).toEqual(new Set(['a-1']));
    });
});
