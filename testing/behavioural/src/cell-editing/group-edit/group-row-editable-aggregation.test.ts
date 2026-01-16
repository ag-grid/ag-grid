import type { IRowNode, NumberFilterModel, SetFilterModel } from 'ag-grid-community';

import { GridRows } from '../../test-utils';
import { expect } from '../../test-utils/matchers';
import type { ValueSetterCallback } from './group-edit-test-utils';
import { EDIT_MODES, asyncSetTimeout, editCell, gridsManager } from './group-edit-test-utils';

afterEach(() => {
    gridsManager.reset();
});

type RowNodeWithAggChildren = IRowNode & {
    childrenAfterAggFilter?: IRowNode[] | null;
};

function getDistributableChildren(node: IRowNode) {
    const typedNode = node as RowNodeWithAggChildren;
    return typedNode.childrenAfterAggFilter ?? node.childrenAfterFilter ?? node.childrenAfterGroup ?? [];
}

describe.each(EDIT_MODES)('groupRowEditable cascading edits (%s)', (editMode) => {
    test('custom valueSetter updates children and aggregation refreshes parents when enableGroupEdit is true', async () => {
        const rowData = [
            { id: 'fr-paris', region: 'Europe', country: 'France', amount: 30 },
            { id: 'fr-lyon', region: 'Europe', country: 'France', amount: 30 },
            { id: 'de-berlin', region: 'Europe', country: 'Germany', amount: 30 },
            { id: 'de-hamburg', region: 'Europe', country: 'Germany', amount: 30 },
            { id: 'it-rome', region: 'Europe', country: 'Italy', amount: 30 },
            { id: 'it-milan', region: 'Europe', country: 'Italy', amount: 30 },
            { id: 'us-nyc', region: 'Americas', country: 'USA', amount: 70 },
            { id: 'us-la', region: 'Americas', country: 'USA', amount: 30 },
            { id: 'ca-toronto', region: 'Americas', country: 'Canada', amount: 35 },
            { id: 'ca-vancouver', region: 'Americas', country: 'Canada', amount: 25 },
        ];
        const setterTargets: boolean[] = [];
        let groupSetterCount = 0;
        let leafSetterCount = 0;

        const distributeValue = (target: IRowNode, value: number): void => {
            if (!Number.isFinite(value) || !target.group) {
                return;
            }

            const children = getDistributableChildren(target);
            if (!children.length) {
                return;
            }

            const perChild = value / children.length;
            for (const child of children) {
                if (!child) {
                    continue;
                }
                child.setDataValue('amount', perChild);
            }
        };

        const valueSetter: ValueSetterCallback = ({ newValue, node }) => {
            if (!node) {
                return false;
            }
            const isGroupNode = !!node.group;
            setterTargets.push(isGroupNode);
            const numericValue = Number(newValue);
            if (!Number.isFinite(numericValue)) {
                return true;
            }
            if (!isGroupNode) {
                leafSetterCount++;
                return false;
            }
            groupSetterCount++;
            distributeValue(node, numericValue);
            return false;
        };

        const api = await gridsManager.createGridAndWait('group-row-editable-changed-path', {
            defaultColDef: {
                cellEditor: 'agTextCellEditor',
            },
            enableGroupEdit: true,
            undoRedoCellEditing: true,
            groupDisplayType: 'custom',
            columnDefs: [
                {
                    colId: 'group',
                    headerName: 'Group',
                    cellRenderer: 'agGroupCellRenderer',
                },
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable: true,
                    valueSetter,
                },
            ],
            rowData,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        const beforeEditSnapshot = `
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:180
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:60
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:60
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:160
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `;

        await new GridRows(api, 'before edit').check(beforeEditSnapshot);

        const europeNode = api.getRowNode('row-group-region-Europe');
        expect(europeNode).toBeDefined();
        expect(europeNode!.data).toBeUndefined();

        const amountColId = 'amount';
        if (editMode === 'ui') {
            await editCell(api, europeNode!, amountColId, '600');
        } else {
            europeNode!.setDataValue(amountColId, 600, 'ui');
            await asyncSetTimeout(0);
        }
        await asyncSetTimeout(0);
        expect(setterTargets.length).toBeGreaterThan(0);
        expect(setterTargets.every(Boolean)).toBe(true);
        expect(groupSetterCount).toBe(setterTargets.length);
        expect(leafSetterCount).toBe(0);
        expect(europeNode!.data).toBeUndefined();

        const afterEditSnapshot = `
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:600
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:200
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:100
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:100
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:200
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:100
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:100
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:200
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:100
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:100
            └─┬ filler id:row-group-region-Americas amount:160
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `;

        await new GridRows(api, 'after edit').check(afterEditSnapshot);

        // TODO: make undo work with group row editing and cascading updates
        // if (editMode === 'ui') {
        //     api.undoCellEditing();
        //     await asyncSetTimeout(0);

        //     await new GridRows(api, 'after undo').check(beforeEditSnapshot);
        //     expect(europeNode!.data).toBeUndefined();
        // }
    });

    test('editing a single leaf updates its parent aggregations', async () => {
        const rowData = [
            { id: 'fr-paris', region: 'Europe', country: 'France', amount: 30 },
            { id: 'fr-lyon', region: 'Europe', country: 'France', amount: 30 },
            { id: 'de-berlin', region: 'Europe', country: 'Germany', amount: 30 },
            { id: 'de-hamburg', region: 'Europe', country: 'Germany', amount: 30 },
            { id: 'it-rome', region: 'Europe', country: 'Italy', amount: 30 },
            { id: 'it-milan', region: 'Europe', country: 'Italy', amount: 30 },
            { id: 'us-nyc', region: 'Americas', country: 'USA', amount: 70 },
            { id: 'us-la', region: 'Americas', country: 'USA', amount: 30 },
            { id: 'ca-toronto', region: 'Americas', country: 'Canada', amount: 35 },
            { id: 'ca-vancouver', region: 'Americas', country: 'Canada', amount: 25 },
        ];
        const setterTargets: boolean[] = [];
        let groupSetterCount = 0;
        let leafSetterCount = 0;

        const distributeValue = (target: IRowNode, value: number): void => {
            if (!Number.isFinite(value) || !target.group) {
                return;
            }

            const children = getDistributableChildren(target);
            if (!children.length) {
                return;
            }

            const perChild = value / children.length;
            for (const child of children) {
                if (!child) {
                    continue;
                }
                child.setDataValue('amount', perChild);
            }
        };

        const valueSetter: ValueSetterCallback = ({ newValue, node }) => {
            if (!node) {
                return false;
            }
            const isGroupNode = !!node.group;
            setterTargets.push(isGroupNode);
            const numericValue = Number(newValue);
            if (!Number.isFinite(numericValue)) {
                return true;
            }
            if (!isGroupNode) {
                leafSetterCount++;
                return false;
            }
            groupSetterCount++;
            distributeValue(node, numericValue);
            return false;
        };

        const api = await gridsManager.createGridAndWait('group-row-editable-leaf-edit', {
            defaultColDef: {
                cellEditor: 'agTextCellEditor',
            },
            enableGroupEdit: true,
            undoRedoCellEditing: true,
            groupDisplayType: 'custom',
            columnDefs: [
                {
                    colId: 'group',
                    headerName: 'Group',
                    cellRenderer: 'agGroupCellRenderer',
                },
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable: true,
                    valueSetter,
                },
            ],
            rowData,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        const snapshotBeforeLeafEdit = `
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:180
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:60
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:60
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:160
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `;

        await new GridRows(api, 'before leaf edit').check(snapshotBeforeLeafEdit);

        const parisNode = api.getRowNode('fr-paris');
        expect(parisNode).toBeDefined();

        const amountColId = 'amount';
        if (editMode === 'ui') {
            await editCell(api, parisNode!, amountColId, '45');
        } else {
            parisNode!.setDataValue(amountColId, 45, 'ui');
            await asyncSetTimeout(0);
        }
        await asyncSetTimeout(0);

        expect(groupSetterCount).toBe(0);
        expect(leafSetterCount).toBe(0);
        expect(setterTargets).toHaveLength(0);

        const snapshotAfterLeafEdit = `
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:195
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:75
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:45
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:60
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:160
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `;

        await new GridRows(api, 'after leaf edit').check(snapshotAfterLeafEdit);

        await asyncSetTimeout(0);
        expect(groupSetterCount).toBe(0);
        expect(leafSetterCount).toBe(0);
        expect(setterTargets).toHaveLength(0);

        const europeNode = api.getRowNode('row-group-region-Europe');
        expect(europeNode?.data).toBeUndefined();
        expect(europeNode?.aggData?.amount ?? 0).toBe(195);

        const franceGroupNode = api.getRowNode('row-group-region-Europe-country-France');
        expect(franceGroupNode?.aggData?.amount ?? 0).toBe(75);

        expect(api.getRowNode('fr-paris')?.data?.amount).toBe(45);
        expect(api.getRowNode('fr-lyon')?.data?.amount).toBe(30);
    });

    test('group edits over filtered groups only adjust filtered descendants', async () => {
        const rowData = [
            { id: 'fr-paris', region: 'Europe', country: 'France', amount: 30 },
            { id: 'fr-lyon', region: 'Europe', country: 'France', amount: 30 },
            { id: 'de-berlin', region: 'Europe', country: 'Germany', amount: 30 },
            { id: 'de-hamburg', region: 'Europe', country: 'Germany', amount: 30 },
            { id: 'it-rome', region: 'Europe', country: 'Italy', amount: 30 },
            { id: 'it-milan', region: 'Europe', country: 'Italy', amount: 30 },
            { id: 'us-nyc', region: 'Americas', country: 'USA', amount: 70 },
            { id: 'us-la', region: 'Americas', country: 'USA', amount: 30 },
            { id: 'ca-toronto', region: 'Americas', country: 'Canada', amount: 35 },
            { id: 'ca-vancouver', region: 'Americas', country: 'Canada', amount: 25 },
        ];
        const setterTargets: boolean[] = [];
        let groupSetterCount = 0;
        let leafSetterCount = 0;

        const distributeValue = (target: IRowNode, value: number): void => {
            if (!Number.isFinite(value) || !target.group) {
                return;
            }

            const children = getDistributableChildren(target);
            if (!children.length) {
                return;
            }

            const perChild = value / children.length;
            for (const child of children) {
                if (!child) {
                    continue;
                }
                child.setDataValue('amount', perChild);
            }
        };

        const valueSetter: ValueSetterCallback = ({ newValue, node }) => {
            if (!node) {
                return false;
            }
            const isGroupNode = !!node.group;
            setterTargets.push(isGroupNode);
            const numericValue = Number(newValue);
            if (!Number.isFinite(numericValue)) {
                return true;
            }
            if (!isGroupNode) {
                leafSetterCount++;
                return false;
            }
            groupSetterCount++;
            distributeValue(node, numericValue);
            return false;
        };

        const api = await gridsManager.createGridAndWait('group-row-editable-filtered', {
            defaultColDef: {
                cellEditor: 'agTextCellEditor',
            },
            enableGroupEdit: true,
            undoRedoCellEditing: true,
            groupDisplayType: 'custom',
            groupAggFiltering: true,
            columnDefs: [
                {
                    colId: 'group',
                    headerName: 'Group',
                    cellRenderer: 'agGroupCellRenderer',
                },
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true, filter: 'agSetColumnFilter' },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable: true,
                    filter: 'agNumberColumnFilter',
                    valueSetter,
                },
            ],
            rowData,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        const filterModel: Record<string, SetFilterModel | NumberFilterModel> = {
            country: {
                filterType: 'set',
                values: ['France', 'Germany'],
            } as SetFilterModel,
            amount: {
                filterType: 'number',
                type: 'greaterThan',
                filter: 100,
            } as NumberFilterModel,
        };
        api.setFilterModel(filterModel);
        await asyncSetTimeout(0);

        const filteredSnapshotBeforeEdit = `
                        ROOT id:ROOT_NODE_ID
                        └─┬ filler id:row-group-region-Europe amount:180
                        · ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:60
                        · │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30
                        · │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
                        · └─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
                        · · ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
                        · · └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
                `;
        await new GridRows(api, 'after applying filters').check(filteredSnapshotBeforeEdit);

        const europeNode = api.getRowNode('row-group-region-Europe');
        expect(europeNode).toBeDefined();
        expect(europeNode!.data).toBeUndefined();

        const amountColId = 'amount';
        if (editMode === 'ui') {
            await editCell(api, europeNode!, amountColId, '240');
        } else {
            europeNode!.setDataValue(amountColId, 240, 'ui');
            await asyncSetTimeout(0);
        }
        await asyncSetTimeout(0);
        expect(setterTargets.length).toBeGreaterThan(0);
        expect(setterTargets.every(Boolean)).toBe(true);
        expect(groupSetterCount).toBe(setterTargets.length);
        expect(leafSetterCount).toBe(0);

        const filteredSnapshotAfterEdit = `
                        ROOT id:ROOT_NODE_ID
                        └─┬ filler id:row-group-region-Europe amount:300
                        · ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:120
                        · │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:60
                        · │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:60
                        · └─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:120
                        · · ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:60
                        · · └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:60
                `;
        await new GridRows(api, 'after filtered edit').check(filteredSnapshotAfterEdit);

        expect(api.getRowNode('it-rome')?.data?.amount).toBe(30);
        expect(api.getRowNode('it-milan')?.data?.amount).toBe(30);

        api.setFilterModel(null);
        await asyncSetTimeout(0);

        const fullSnapshotAfterClearing = `
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:300
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:120
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:60
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:60
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:120
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:60
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:60
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:60
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:160
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `;
        await new GridRows(api, 'after clearing filters').check(fullSnapshotAfterClearing);

        api.setFilterModel(filterModel);
        await asyncSetTimeout(0);
        await new GridRows(api, 'after reapplying filters').check(filteredSnapshotAfterEdit);
    });
});
