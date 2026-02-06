import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, TextEditorModule, TextFilterModule, TooltipModule } from 'ag-grid-community';
import { CellSelectionModule, FormulaModule, SetFilterModule } from 'ag-grid-enterprise';
import type { SetFilter } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, applyTransactionChecked, waitForEvent } from '../test-utils';

describe('ag-grid formulas filtering', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            CellSelectionModule,
            FormulaModule,
            SetFilterModule,
            TextEditorModule,
            TextFilterModule,
            TooltipModule,
        ],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const basicRowData = [
        { id: '1', name: 'John', A: 10 },
        { id: '2', name: 'Mary', A: 25 },
        { id: '3', name: 'Bob', A: 30 },
        { id: '4', name: 'Alice', A: 45 },
        { id: '5', name: 'Jack', A: 50 },
    ];

    test('TC1 Simple formula result filtering', async () => {
        const gridOptions: GridOptions = {
            rowData: basicRowData.map((data, i) => ({ ...data, B: '=A' + (i + 1) + '*2' })),
            columnDefs: [{ field: 'A' }, { field: 'B', filter: 'agNumberColumnFilter' }, { field: 'name' }],
            defaultColDef: {
                allowFormula: true,
            },
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        let gridRows = new GridRows(api, 'initial');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID 
            ├── LEAF id:1 row-number:"1" A:10 B:20 name:"John"
            ├── LEAF id:2 row-number:"2" A:25 B:50 name:"Mary"
            ├── LEAF id:3 row-number:"3" A:30 B:60 name:"Bob"
            ├── LEAF id:4 row-number:"4" A:45 B:90 name:"Alice"
            └── LEAF id:5 row-number:"5" A:50 B:100 name:"Jack"
        `);

        api.setFilterModel({ B: { type: 'lessThan', filter: 60 } });
        gridRows = new GridRows(api, 'filter b < 60');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:10 B:20 name:"John"
            └── LEAF id:2 row-number:"2" A:25 B:50 name:"Mary"
        `);

        api.setFilterModel({ B: { type: 'greaterThan', filter: 60 } });
        gridRows = new GridRows(api, 'filter b > 60');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:4 row-number:"4" A:45 B:90 name:"Alice"
            └── LEAF id:5 row-number:"5" A:50 B:100 name:"Jack"
        `);

        applyTransactionChecked(api, { update: [{ id: '1', name: 'John Wick', A: 99, B: '=A1*2' }] });
        gridRows = new GridRows(api, 'filter b < 60 - update John');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:99 B:198 name:"John Wick"
            ├── LEAF id:4 row-number:"4" A:45 B:90 name:"Alice"
            └── LEAF id:5 row-number:"5" A:50 B:100 name:"Jack"
        `);
    });

    test('TC1-2 Set filter retains formula in editor after filtering', async () => {
        const athleteData = [
            { id: '1', athlete: 'Michael Phelps', age: '23', country: 'United States', year: 2008, total: 8 },
            { id: '2', athlete: 'Ian Thorpe', age: '24', country: 'Australia', year: 2004, total: 5 },
            { id: '3', athlete: 'Ryan Lochte', age: '27', country: 'United States', year: 2012, total: 5 },
            { id: '4', athlete: 'Chad Le Clos', age: '20', country: 'South Africa', year: 2016, total: 4 },
        ];

        const gridOptions: GridOptions = {
            rowNumbers: true,
            rowData: athleteData,
            columnDefs: [
                { field: 'athlete', filter: 'agSetColumnFilter', editable: true },
                { field: 'age', cellDataType: 'text', editable: true },
                { field: 'country' },
                { field: 'year' },
                { field: 'total' },
            ],
            getRowId: (params) => params.data?.id,
            defaultColDef: {
                allowFormula: true,
                editable: true,
                filter: true,
            },
        };

        const api = gridsManager.createGrid('tc1-2', gridOptions);

        await waitForEvent('firstDataRendered', api);

        const cellChanged = waitForEvent('cellValueChanged', api);
        api.getRowNode('1')?.setDataValue('athlete', '=B2');
        await cellChanged;

        const filterChanged = waitForEvent('filterChanged', api);
        api.setFilterModel({ athlete: { filterType: 'set', values: ['24'] } });
        await filterChanged;

        const editingStarted = waitForEvent('cellEditingStarted', api);
        api.startEditingCell({ rowIndex: 0, colKey: 'athlete' });
        await editingStarted;

        const [editor] = api.getCellEditorInstances();
        expect(editor?.getValue()).toEqual('=B2');

        const editingStopped = waitForEvent('cellEditingStopped', api);
        api.stopEditing(true);
        await editingStopped;
    });

    test('TC2 Reference to filtered row', async () => {
        const formulaRowData = [
            { id: '1', A: 5, B: '=A1*3' },
            { id: '2', A: 10, B: '=A1+A2' },
            { id: '3', A: 15, B: '=A2+A3' },
            { id: '4', A: 20, B: '=A3+A4' },
        ];

        const gridOptions: GridOptions = {
            rowData: formulaRowData,
            columnDefs: [{ field: 'A', filter: 'agNumberColumnFilter' }, { field: 'B' }],
            defaultColDef: {
                allowFormula: true,
            },
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('formulaGrid', gridOptions);

        let gridRows = new GridRows(api, 'initial');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:5 B:15
            ├── LEAF id:2 row-number:"2" A:10 B:15
            ├── LEAF id:3 row-number:"3" A:15 B:25
            └── LEAF id:4 row-number:"4" A:20 B:35
        `);

        api.setFilterModel({ A: { type: 'greaterThan', filter: 10 } });

        gridRows = new GridRows(api, 'filtered A > 10');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:3 row-number:"3" A:15 B:25
            └── LEAF id:4 row-number:"4" A:20 B:35
        `);

        applyTransactionChecked(api, { update: [{ id: '2', A: 9 }] });

        gridRows = new GridRows(api, 'filtered A > 10 after hidden update');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:3 row-number:"3" A:15 B:24
            └── LEAF id:4 row-number:"4" A:20 B:35
        `);
    });

    test('TC2-1 Text filter honours evaluated formulas when refiltering', async () => {
        const athleteData = [
            { id: '1', athlete: 'Michael Phelps' },
            { id: '2', athlete: 'Michael Phelps' },
            { id: '3', athlete: 'Michael Phelps' },
            { id: '4', athlete: 'Chad Le Clos' },
        ];

        const gridOptions: GridOptions = {
            rowNumbers: true,
            rowData: athleteData,
            columnDefs: [{ field: 'athlete', filter: 'agTextColumnFilter', cellDataType: 'text', editable: true }],
            getRowId: (params) => params.data?.id,
            undoRedoCellEditing: true,
            cellSelection: {
                handle: { mode: 'fill' },
            },
            defaultColDef: {
                flex: 1,
                minWidth: 150,
                allowFormula: true,
                filter: 'agTextColumnFilter',
                suppressHeaderMenuButton: true,
                suppressHeaderContextMenu: true,
                editable: true,
                cellDataType: 'text',
            },
        };

        const api = gridsManager.createGrid('tc2-2', gridOptions);

        await waitForEvent('firstDataRendered', api);

        const applyMichaelFilter = async () => {
            const filterChanged = waitForEvent('filterChanged', api);
            api.setFilterModel({
                athlete: {
                    filterType: 'text',
                    type: 'equals',
                    filter: 'Michael Phelps',
                },
            });
            await filterChanged;
        };

        const clearFilter = async () => {
            const filterChanged = waitForEvent('filterChanged', api);
            api.setFilterModel(null);
            await filterChanged;
        };

        await applyMichaelFilter();

        let gridRows = new GridRows(api, 'filter Michael Phelps initial');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" athlete:"Michael Phelps"
            ├── LEAF id:2 row-number:"2" athlete:"Michael Phelps"
            └── LEAF id:3 row-number:"3" athlete:"Michael Phelps"
        `);

        await clearFilter();

        const cellChanged = waitForEvent('cellValueChanged', api);
        api.getRowNode('4')?.setDataValue('athlete', '=A1');
        await cellChanged;

        await applyMichaelFilter();

        gridRows = new GridRows(api, 'filter Michael Phelps after row 4 edit');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" athlete:"Michael Phelps"
            ├── LEAF id:2 row-number:"2" athlete:"Michael Phelps"
            ├── LEAF id:3 row-number:"3" athlete:"Michael Phelps"
            └── LEAF id:4 row-number:"4" athlete:"Michael Phelps"
        `);
    });

    test('TC3 Circular reference with filtering', async () => {
        const circularRowData = [
            { id: '1', A: '=B2', B: 10 },
            { id: '2', A: '=B3', B: 20 },
            { id: '3', A: '=B1', B: 30 },
        ];

        const gridOptions: GridOptions = {
            rowData: circularRowData,
            columnDefs: [{ field: 'A' }, { field: 'B', filter: 'agNumberColumnFilter' }],
            defaultColDef: {
                allowFormula: true,
            },
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('circularGrid', gridOptions);

        let gridRows = new GridRows(api, 'initial');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:20 B:10
            ├── LEAF id:2 row-number:"2" A:30 B:20
            └── LEAF id:3 row-number:"3" A:10 B:30
        `);

        api.setFilterModel({ B: { type: 'greaterThan', filter: 15 } });

        gridRows = new GridRows(api, 'filtered B > 15');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 row-number:"2" A:30 B:20
            └── LEAF id:3 row-number:"3" A:10 B:30
        `);
    });

    test('TC3-1 Set filter lists evaluated formula values', async () => {
        const personData = [
            {
                id: '1',
                athlete: 'Michael Phelps',
                country: 'United States',
                sport: 'Swimming',
                year: 2008,
                gold: 8,
                silver: 0,
                bronze: 0,
                total: 8,
            },
            {
                id: '2',
                athlete: 'Ref Judge',
                country: 'United States',
                sport: 'Swimming',
                year: 2008,
                gold: 0,
                silver: 1,
                bronze: 0,
                total: 1,
            },
            {
                id: '3',
                athlete: 'Laura Trott',
                country: 'Great Britain',
                sport: 'Cycling',
                year: 2012,
                gold: 2,
                silver: 0,
                bronze: 0,
                total: 2,
            },
        ];

        const gridOptions: GridOptions = {
            rowData: personData,
            columnDefs: [{ field: 'athlete', filter: 'agSetColumnFilter' }, { field: 'country' }, { field: 'sport' }],
            defaultColDef: {
                allowFormula: true,
            },
            getRowId: (params) => params.data?.id,
        };

        const api = gridsManager.createGrid('tc3-2', gridOptions);

        await waitForEvent('firstDataRendered', api);

        const setFilter = (await api.getColumnFilterInstance('athlete')) as SetFilter<any> | null | undefined;
        if (!setFilter) {
            throw new Error('Expected SetFilter instance for athlete column');
        }

        const initialKeys = (await setFilter.handler.valueModel.allKeys) ?? [];
        expect(initialKeys.filter((key): key is string => typeof key === 'string').sort()).toEqual([
            'Laura Trott',
            'Michael Phelps',
            'Ref Judge',
        ]);

        const cellChanged = waitForEvent('cellValueChanged', api);
        api.getRowNode('2')?.setDataValue('athlete', '=A1');
        await cellChanged;

        await setFilter.handler.valueModel.refreshAll();
        const updatedKeys = (await setFilter.handler.valueModel.allKeys) ?? [];

        expect(updatedKeys.filter((key): key is string => typeof key === 'string').sort()).toEqual([
            'Laura Trott',
            'Michael Phelps',
        ]);
    });

    test('TC3-2 Set filter applies evaluated formulas when refiltering', async () => {
        const athleteData = [
            {
                id: '1',
                athlete: 'Michael Phelps',
                country: 'United States',
                sport: 'Swimming',
                year: 2008,
                gold: 8,
                silver: 0,
                bronze: 0,
                total: 8,
            },
            {
                id: '2',
                athlete: 'Ref Judge',
                country: 'United States',
                sport: 'Swimming',
                year: 2008,
                gold: 0,
                silver: 1,
                bronze: 0,
                total: 1,
            },
            {
                id: '3',
                athlete: 'Michael Phelps',
                country: 'United States',
                sport: 'Swimming',
                year: 2012,
                gold: 4,
                silver: 2,
                bronze: 0,
                total: 6,
            },
            {
                id: '4',
                athlete: 'Chad Le Clos',
                country: 'South Africa',
                sport: 'Swimming',
                year: 2016,
                gold: 1,
                silver: 3,
                bronze: 0,
                total: 4,
            },
        ];

        const gridOptions: GridOptions = {
            rowNumbers: true,
            rowData: athleteData,
            columnDefs: [
                { field: 'athlete', filter: 'agSetColumnFilter', minWidth: 150 },
                { field: 'country', minWidth: 120 },
                { field: 'sport', minWidth: 120 },
            ],
            defaultColDef: {
                allowFormula: true,
            },
            getRowId: (params) => params.data?.id,
        };

        const api = gridsManager.createGrid('tc3-3', gridOptions);

        await waitForEvent('firstDataRendered', api);

        const toMichaelFilter = async () => {
            const filterChanged = waitForEvent('filterChanged', api);
            api.setFilterModel({ athlete: { filterType: 'set', values: ['Michael Phelps'] } });
            await filterChanged;
        };

        const clearFilter = async () => {
            const filterChanged = waitForEvent('filterChanged', api);
            api.setFilterModel(null);
            await filterChanged;
        };

        let cellChanged = waitForEvent('cellValueChanged', api);
        api.getRowNode('2')?.setDataValue('athlete', '=A1');
        await cellChanged;

        await toMichaelFilter();

        let gridRows = new GridRows(api, 'filter Michael Phelps after row 2 edit');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" athlete:"Michael Phelps" country:"United States" sport:"Swimming"
            ├── LEAF id:2 row-number:"2" athlete:"Michael Phelps" country:"United States" sport:"Swimming"
            └── LEAF id:3 row-number:"3" athlete:"Michael Phelps" country:"United States" sport:"Swimming"
        `);

        await clearFilter();

        cellChanged = waitForEvent('cellValueChanged', api);
        api.getRowNode('4')?.setDataValue('athlete', '=A1');
        await cellChanged;

        await toMichaelFilter();

        gridRows = new GridRows(api, 'filter Michael Phelps after row 4 edit');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" athlete:"Michael Phelps" country:"United States" sport:"Swimming"
            ├── LEAF id:2 row-number:"2" athlete:"Michael Phelps" country:"United States" sport:"Swimming"
            ├── LEAF id:3 row-number:"3" athlete:"Michael Phelps" country:"United States" sport:"Swimming"
            └── LEAF id:4 row-number:"4" athlete:"Michael Phelps" country:"South Africa" sport:"Swimming"
        `);
    });

    test('TC4 Range reference across filtered rows', async () => {
        const rangeRowData = [
            { id: '1', A: 1, B: '=SUM(A1:A6)' },
            { id: '2', A: 2, B: '=SUM(A1:A6)' },
            { id: '3', A: 3, B: '=SUM(A1:A6)' },
            { id: '4', A: 4, B: '=SUM(A1:A6)' },
            { id: '5', A: 5, B: '=SUM(A1:A6)' },
            { id: '6', A: 6, B: '=SUM(A1:A6)' },
        ];

        const gridOptions: GridOptions = {
            rowData: rangeRowData,
            columnDefs: [{ field: 'A', filter: 'agNumberColumnFilter' }, { field: 'B' }],
            defaultColDef: {
                allowFormula: true,
            },
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('rangeGrid', gridOptions);

        let gridRows = new GridRows(api, 'initial');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:1 B:21
            ├── LEAF id:2 row-number:"2" A:2 B:21
            ├── LEAF id:3 row-number:"3" A:3 B:21
            ├── LEAF id:4 row-number:"4" A:4 B:21
            ├── LEAF id:5 row-number:"5" A:5 B:21
            └── LEAF id:6 row-number:"6" A:6 B:21
        `);

        const modelUpdated = waitForEvent('modelUpdated', api);
        api.setFilterModel({
            A: {
                filterType: 'number',
                operator: 'AND',
                conditions: [
                    { filterType: 'number', type: 'greaterThan', filter: 2 },
                    { filterType: 'number', type: 'lessThan', filter: 6 },
                ],
            },
        });
        await modelUpdated;

        gridRows = new GridRows(api, 'filtered 2 < A < 6');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:3 row-number:"3" A:3 B:21
            ├── LEAF id:4 row-number:"4" A:4 B:21
            └── LEAF id:5 row-number:"5" A:5 B:21
        `);

        applyTransactionChecked(api, {
            update: [
                { id: '1', A: 1, B: '=SUM(A1:A6)' },
                { id: '2', A: 2, B: '=SUM(A2:A6)' },
                { id: '3', A: 3, B: '=SUM(A1:A3)+SUM(A4:A6)' },
                { id: '4', A: 4, B: '=SUM(A3:A5)+B2' },
                { id: '5', A: 5, B: '=B4 - A1' },
                { id: '6', A: 6, B: '=B5 - (A2 + A3)' },
            ],
        });

        gridRows = new GridRows(api, 'filtered 2 < A < 6 after range updates');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:3 row-number:"3" A:3 B:21
            ├── LEAF id:4 row-number:"4" A:4 B:32
            └── LEAF id:5 row-number:"5" A:5 B:31
        `);

        api.setFilterModel({});

        gridRows = new GridRows(api, 'filtered 2 < A < 6 after range updates');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:1 B:21
            ├── LEAF id:2 row-number:"2" A:2 B:20
            ├── LEAF id:3 row-number:"3" A:3 B:21
            ├── LEAF id:4 row-number:"4" A:4 B:32
            ├── LEAF id:5 row-number:"5" A:5 B:31
            └── LEAF id:6 row-number:"6" A:6 B:26
        `);
    });

    test('TC4-1 Custom filter honours formula edits', async () => {
        const personData = [
            {
                id: '1',
                athlete: 'Michael Phelps',
                country: 'United States',
                sport: 'Swimming',
                year: 2008,
                gold: 8,
                silver: 0,
                bronze: 0,
                total: 8,
            },
            {
                id: '2',
                athlete: 'Ref Judge',
                country: 'United States',
                sport: 'Swimming',
                year: 2008,
                gold: 0,
                silver: 1,
                bronze: 0,
                total: 1,
            },
            {
                id: '3',
                athlete: 'Laura Trott',
                country: 'Great Britain',
                sport: 'Cycling',
                year: 2012,
                gold: 2,
                silver: 0,
                bronze: 0,
                total: 2,
            },
        ];

        class PersonFilter {
            private model: string | null = null;
            private params!: any;
            private readonly eGui = document.createElement('div');

            public init(params: any) {
                this.params = params;
                this.model = params.model ?? null;
            }

            public getGui(): HTMLElement {
                return this.eGui;
            }

            public isFilterActive(): boolean {
                return !!this.model && this.model.trim() !== '';
            }

            public getModel(): string | null {
                return this.model;
            }

            public setModel(model: any): void {
                const nextModel = typeof model === 'string' ? model : model ?? null;
                if (nextModel === this.model) {
                    return;
                }

                this.model = nextModel;
                this.params.filterChangedCallback();
            }

            public doesFilterPass(params: any): boolean {
                if (!this.isFilterActive()) {
                    return true;
                }

                const filterWords = (this.model ?? '')
                    .toLowerCase()
                    .split(' ')
                    .filter((word) => word !== '');

                const resolvedValue = this.params.getValue(params.node);
                const value = String(resolvedValue ?? '').toLowerCase();

                return filterWords.every((word) => value.includes(word));
            }

            public afterGuiAttached(): void {}
            public destroy(): void {}
            public refresh(): boolean {
                return true;
            }
        }

        const gridOptions: GridOptions = {
            rowNumbers: true,
            components: {
                personFilter: PersonFilter,
            },
            defaultColDef: {
                editable: true,
                flex: 1,
                minWidth: 100,
                allowFormula: true,
            },
            columnDefs: [
                {
                    field: 'athlete',
                    minWidth: 150,
                    filter: 'personFilter',
                },
                { field: 'country', minWidth: 120 },
                { field: 'sport', minWidth: 120 },
                { field: 'year', minWidth: 110 },
                { field: 'gold' },
                { field: 'silver' },
                { field: 'bronze' },
                { field: 'total' },
            ],
            rowData: personData,
            getRowId: (params) => params.data?.id,
        };

        const api = gridsManager.createGrid('tc4-2', gridOptions);

        const cellChanged = waitForEvent('cellValueChanged', api);
        api.getRowNode('2')?.setDataValue('athlete', '=A1');
        await cellChanged;

        const applyFilter = async (value: string | null) => {
            const filterChanged = waitForEvent('filterChanged', api);
            api.setFilterModel(value ? { athlete: value } : null);
            await filterChanged;
        };

        await applyFilter('Michael');
        let gridRows = new GridRows(api, 'custom filter');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" athlete:"Michael Phelps" country:"United States" sport:"Swimming" year:2008 gold:8 silver:0 bronze:0 total:8
            └── LEAF id:2 row-number:"2" athlete:"Michael Phelps" country:"United States" sport:"Swimming" year:2008 gold:0 silver:1 bronze:0 total:1
        `);

        await applyFilter('REF');
        gridRows = new GridRows(api, 'custom filter');
        await gridRows.check('empty');
    });
});
