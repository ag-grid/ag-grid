import type { GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    NumberFilterModule,
    TextEditorModule,
    TextFilterModule,
    TooltipModule,
    UndoRedoEditModule,
} from 'ag-grid-community';
import { CellSelectionModule, FormulaModule, SetFilterModule } from 'ag-grid-enterprise';
import type { SetFilter } from 'ag-grid-enterprise';

import {
    GridColumns,
    GridRows,
    TestGridsManager,
    applyTransactionChecked,
    asyncSetTimeout,
    waitForEvent,
} from '../test-utils';

describe('ag-grid formulas filtering', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            NumberFilterModule,
            UndoRedoEditModule,
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

        await new GridColumns(api, 'columns').checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── A width:200
            ├── B width:200 filter
            └── name "Name" width:200
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

        await asyncSetTimeout(10);

        await new GridColumns(api, 'columns').checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── athlete "Athlete" width:200 filter editable
            ├── age "Age" width:200 editable
            ├── country "Country" width:200 editable
            ├── year "Year" width:200 editable
            └── total "Total" width:200 editable
        `);
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
        await new GridColumns(api, `TC3-1 Set filter lists evaluated formula values setup`).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── athlete "Athlete" width:200
            ├── country "Country" width:200
            └── sport "Sport" width:200
        `);
        await new GridRows(api, `TC3-1 Set filter lists evaluated formula values setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" athlete:"Michael Phelps" country:"United States" sport:"Swimming"
            ├── LEAF id:2 row-number:"2" athlete:"Ref Judge" country:"United States" sport:"Swimming"
            └── LEAF id:3 row-number:"3" athlete:"Laura Trott" country:"Great Britain" sport:"Cycling"
        `);

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
        await new GridRows(api, `TC3-1 Set filter lists evaluated formula values final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" athlete:"Michael Phelps" country:"United States" sport:"Swimming"
            ├── LEAF id:2 row-number:"2" athlete:"Michael Phelps" country:"United States" sport:"Swimming"
            └── LEAF id:3 row-number:"3" athlete:"Laura Trott" country:"Great Britain" sport:"Cycling"
        `);
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
                const nextModel = typeof model === 'string' ? model : (model ?? null);
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

    test('TC5 Cell selection during formula editing uses formula row index, not filtered display index', async () => {
        const gridOptions: GridOptions = {
            rowData: [
                { id: '1', A: 10, B: '' },
                { id: '2', A: 20, B: '' },
                { id: '3', A: 30, B: '=' },
                { id: '4', A: 40, B: '' },
                { id: '5', A: 50, B: '' },
            ],
            columnDefs: [
                { field: 'A', filter: 'agNumberColumnFilter' },
                { field: 'B', editable: true },
            ],
            defaultColDef: {
                allowFormula: true,
            },
            cellSelection: true,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('tc5', gridOptions);

        api.setFilterModel({ A: { type: 'greaterThan', filter: 25 } });

        const gridRows = new GridRows(api, 'filtered A > 25');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:3 row-number:"3" A:30 B:"="
            ├── LEAF id:4 row-number:"4" A:40 B:""
            └── LEAF id:5 row-number:"5" A:50 B:""
        `);

        // Start editing B in the first visible row (display index 0 = actual row 3).
        // The cell has "=" as its starting value, which activates formula range selection.
        const editingStarted = waitForEvent('cellEditingStarted', api);
        api.startEditingCell({ rowIndex: 0, colKey: 'B' });
        await editingStarted;
        await asyncSetTimeout(5);

        // Simulate clicking on cell A at display index 2 (actual row 5, formula row index 5).
        api.addCellRange({ rowStartIndex: 2, rowEndIndex: 2, columns: ['A'] });
        await asyncSetTimeout(10);

        // The editor should reference A5 (the actual formula row), not A3 (display index 2+1).
        const [editor] = api.getCellEditorInstances();
        const editorValue = String(editor?.getValue() ?? '');
        expect(editorValue).toContain('A5');
        expect(editorValue).not.toContain('A3');

        api.stopEditing(true);
    });

    test('TC5-1 Multi-row range selection during formula editing uses formula row indices across filtered gaps', async () => {
        const gridOptions: GridOptions = {
            rowData: [
                { id: '1', A: 10, B: '' },
                { id: '2', A: 20, B: '' },
                { id: '3', A: 30, B: '=' },
                { id: '4', A: 40, B: '' },
                { id: '5', A: 50, B: '' },
                { id: '6', A: 60, B: '' },
            ],
            columnDefs: [
                { field: 'A', filter: 'agNumberColumnFilter' },
                { field: 'B', editable: true },
            ],
            defaultColDef: {
                allowFormula: true,
            },
            cellSelection: true,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('tc5-1', gridOptions);

        // Filter to show rows 3, 5, 6 (display indices 0, 1, 2). Row 4 is hidden.
        api.setFilterModel({
            A: {
                filterType: 'number',
                operator: 'OR',
                conditions: [
                    { filterType: 'number', type: 'equals', filter: 30 },
                    { filterType: 'number', type: 'greaterThanOrEqual', filter: 50 },
                ],
            },
        });

        const gridRows = new GridRows(api, 'filtered');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:3 row-number:"3" A:30 B:"="
            ├── LEAF id:5 row-number:"5" A:50 B:""
            └── LEAF id:6 row-number:"6" A:60 B:""
        `);

        // Start editing B in the first visible row (display index 0 = formula row 3).
        const editingStarted = waitForEvent('cellEditingStarted', api);
        api.startEditingCell({ rowIndex: 0, colKey: 'B' });
        await editingStarted;
        await asyncSetTimeout(5);

        // Select a range spanning display indices 0-2 (formula rows 3, 5, 6 with a gap at row 4).
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 2, columns: ['A'] });
        await asyncSetTimeout(10);

        // The range ref should be A3:A6 (formula rows 3 through 6), not A1:A3 (display indices).
        const [editor] = api.getCellEditorInstances();
        const editorValue = String(editor?.getValue() ?? '');
        expect(editorValue).toContain('A3:A6');
        expect(editorValue).not.toContain('A1:A3');

        api.stopEditing(true);
    });

    test('TC5-2 Typing a ref to a filtered-out row does not highlight a visible cell', async () => {
        const gridOptions: GridOptions = {
            rowData: [
                { id: '1', A: 10, B: '' },
                { id: '2', A: 20, B: '' },
                { id: '3', A: 30, B: '' },
                { id: '4', A: 40, B: '' },
                { id: '5', A: 50, B: '=' },
            ],
            columnDefs: [
                { field: 'A', filter: 'agNumberColumnFilter' },
                { field: 'B', editable: true },
            ],
            defaultColDef: {
                allowFormula: true,
            },
            cellSelection: true,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('tc5-2', gridOptions);

        // Filter to show only row 5 (display index 0). Rows 1-4 are hidden.
        api.setFilterModel({ A: { type: 'equals', filter: 50 } });

        const gridRows = new GridRows(api, 'filtered A = 50');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:5 row-number:"5" A:50 B:"="
        `);

        // Start editing B in row 5 (the only visible row).
        const editingStarted = waitForEvent('cellEditingStarted', api);
        api.startEditingCell({ rowIndex: 0, colKey: 'B' });
        await editingStarted;
        await asyncSetTimeout(5);

        // Simulate typing "=A1" — A1 references formula row 1 which is filtered out.
        const [editor] = api.getCellEditorInstances() as unknown as [{ agSetEditValue?: (v: unknown) => void }];
        editor?.agSetEditValue?.('=A1');
        await asyncSetTimeout(10);

        // A1 references a filtered-out row, so no cell range should be created.
        const ranges = api.getCellRanges() ?? [];
        const rangeRefs = ranges.map((r) => {
            const startIdx = r.startRow?.rowIndex;
            const endIdx = r.endRow?.rowIndex;
            return { startIdx, endIdx };
        });
        // There should be no range highlighting row 0 (which would mean A1 incorrectly
        // mapped to display index 0 = row 5).
        for (const range of rangeRefs) {
            expect(range.startIdx).not.toBe(0);
        }

        api.stopEditing(true);
    });

    test('TC5-3 Sorting + filtering: cell selection uses formula row index across mid-list gaps', async () => {
        // Sort ascending: formulaRows (childrenAfterSort) = [id:5(10), id:4(20), id:3(30), id:2(40), id:1(50)]
        // formulaRowIndex: id:5=0, id:4=1, id:3=2, id:2=3, id:1=4
        // Filter out id:4(20) and id:2(40) → visible: [id:5(10), id:3(30), id:1(50)]
        // Display indices: 0=id:5, 1=id:3, 2=id:1
        // Old bug: clicking display index 2 → ref A3 (display+1). Fixed: A5 (formulaRowIndex 4+1).
        const gridOptions: GridOptions = {
            rowData: [
                { id: '1', A: 50, B: '' },
                { id: '2', A: 40, B: '' },
                { id: '3', A: 30, B: '' },
                { id: '4', A: 20, B: '' },
                { id: '5', A: 10, B: '=' },
            ],
            columnDefs: [
                { field: 'A', sort: 'asc' as const, filter: 'agNumberColumnFilter' },
                { field: 'B', editable: true },
            ],
            defaultColDef: {
                allowFormula: true,
            },
            cellSelection: true,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('tc5-3', gridOptions);

        // Filter out rows with A=20 and A=40 (even-tens), leaving a gap in formula indices.
        api.setFilterModel({
            A: {
                filterType: 'number',
                operator: 'OR',
                conditions: [
                    { filterType: 'number', type: 'equals', filter: 10 },
                    { filterType: 'number', type: 'equals', filter: 30 },
                    { filterType: 'number', type: 'equals', filter: 50 },
                ],
            },
        });

        const gridRows = new GridRows(api, 'sorted + filtered');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:5 row-number:"1" A:10 B:"="
            ├── LEAF id:3 row-number:"3" A:30 B:""
            └── LEAF id:1 row-number:"5" A:50 B:""
        `);

        // Start editing B in row id:5 (display index 0).
        const editingStarted = waitForEvent('cellEditingStarted', api);
        api.startEditingCell({ rowIndex: 0, colKey: 'B' });
        await editingStarted;
        await asyncSetTimeout(5);

        // Click cell A at display index 2 (row id:1, formula row index 4 → ref A5).
        // Old bug would give A3 (display index 2+1).
        api.addCellRange({ rowStartIndex: 2, rowEndIndex: 2, columns: ['A'] });
        await asyncSetTimeout(10);

        const [editor] = api.getCellEditorInstances();
        const editorValue = String(editor?.getValue() ?? '');
        expect(editorValue).toContain('A5');
        expect(editorValue).not.toContain('A3');

        api.stopEditing(true);
    });

    test('TC5-4 Sorting + filtering: typed ref to filtered-out mid-list row does not highlight', async () => {
        // Sort ascending: formulaRows = [id:5(10), id:4(20), id:3(30), id:2(40), id:1(50)]
        // formulaRowIndex: id:5=0, id:4=1, id:3=2, id:2=3, id:1=4
        // Filter out id:4(20): visible = [id:5(10), id:3(30), id:2(40), id:1(50)]
        // Typing A2 references formula row 1 = id:4(20) which is filtered out.
        const gridOptions: GridOptions = {
            rowData: [
                { id: '1', A: 50, B: '' },
                { id: '2', A: 40, B: '' },
                { id: '3', A: 30, B: '' },
                { id: '4', A: 20, B: '' },
                { id: '5', A: 10, B: '=' },
            ],
            columnDefs: [
                { field: 'A', sort: 'asc' as const, filter: 'agNumberColumnFilter' },
                { field: 'B', editable: true },
            ],
            defaultColDef: {
                allowFormula: true,
            },
            cellSelection: true,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('tc5-4', gridOptions);

        // Filter out row id:4 (A=20) — it's formula row index 1 (A2 in 1-based).
        api.setFilterModel({ A: { type: 'notEqual', filter: 20 } });

        await new GridRows(api, 'sorted + filtered').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:5 row-number:"1" A:10 B:"="
            ├── LEAF id:3 row-number:"3" A:30 B:""
            ├── LEAF id:2 row-number:"4" A:40 B:""
            └── LEAF id:1 row-number:"5" A:50 B:""
        `);

        // Start editing B in row id:5 (display index 0).
        const editingStarted = waitForEvent('cellEditingStarted', api);
        api.startEditingCell({ rowIndex: 0, colKey: 'B' });
        await editingStarted;
        await asyncSetTimeout(5);

        // Type "=A2" — A2 is formula row 1 (id:4, A=20) which is filtered out.
        const [editor] = api.getCellEditorInstances() as unknown as [{ agSetEditValue?: (v: unknown) => void }];
        editor?.agSetEditValue?.('=A2');
        await asyncSetTimeout(10);

        // No range should highlight display index 0 (which would mean A2 incorrectly
        // mapped to the first visible row).
        const ranges = api.getCellRanges() ?? [];
        for (const range of ranges) {
            expect(range.startRow?.rowIndex).not.toBe(0);
        }

        api.stopEditing(true);
    });

    test('TC5-5 Typed range ref with one hidden endpoint highlights the visible portion', async () => {
        const gridOptions: GridOptions = {
            rowData: [
                { id: '1', A: 10, B: '' },
                { id: '2', A: 20, B: '' },
                { id: '3', A: 30, B: '' },
                { id: '4', A: 40, B: '' },
                { id: '5', A: 50, B: '=' },
            ],
            columnDefs: [
                { field: 'A', filter: 'agNumberColumnFilter' },
                { field: 'B', editable: true },
            ],
            defaultColDef: {
                allowFormula: true,
            },
            cellSelection: true,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('tc5-5', gridOptions);

        // Filter to show rows 3-5 (display indices 0,1,2). Rows 1-2 are hidden.
        api.setFilterModel({ A: { type: 'greaterThan', filter: 25 } });

        await new GridRows(api, 'filtered A > 25').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:3 row-number:"3" A:30 B:""
            ├── LEAF id:4 row-number:"4" A:40 B:""
            └── LEAF id:5 row-number:"5" A:50 B:"="
        `);

        // Start editing B in row 5 (display index 2).
        const editingStarted = waitForEvent('cellEditingStarted', api);
        api.startEditingCell({ rowIndex: 2, colKey: 'B' });
        await editingStarted;
        await asyncSetTimeout(5);

        // Type "=A1:A5" — rows 1-2 are filtered out, rows 3-5 are visible.
        const [editor] = api.getCellEditorInstances() as unknown as [{ agSetEditValue?: (v: unknown) => void }];
        editor?.agSetEditValue?.('=A1:A5');
        await asyncSetTimeout(10);

        // A range should be created for the visible portion (display indices 0-2 = rows 3-5).
        const ranges = api.getCellRanges() ?? [];
        const formulaRanges = ranges.filter((r) => r.startRow != null && r.endRow != null);
        expect(formulaRanges.length).toBeGreaterThan(0);

        const range = formulaRanges[0];
        const startDisplay = Math.min(range.startRow!.rowIndex, range.endRow!.rowIndex);
        const endDisplay = Math.max(range.startRow!.rowIndex, range.endRow!.rowIndex);
        expect(startDisplay).toBe(0);
        expect(endDisplay).toBe(2);

        api.stopEditing(true);
    });

    test('TC5-6 Typed range ref where both endpoints are visible but middle rows are filtered highlights correctly', async () => {
        const gridOptions: GridOptions = {
            rowData: [
                { id: '1', A: 10, B: '' },
                { id: '2', A: 20, B: '' },
                { id: '3', A: 30, B: '=' },
                { id: '4', A: 40, B: '' },
                { id: '5', A: 50, B: '' },
            ],
            columnDefs: [
                { field: 'A', filter: 'agNumberColumnFilter' },
                { field: 'B', editable: true },
            ],
            defaultColDef: {
                allowFormula: true,
            },
            cellSelection: true,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('tc5-6', gridOptions);

        // Filter to show rows 3 and 5 (display indices 0 and 1). Row 4 is hidden.
        api.setFilterModel({
            A: {
                filterType: 'number',
                operator: 'OR',
                conditions: [
                    { filterType: 'number', type: 'equals', filter: 30 },
                    { filterType: 'number', type: 'equals', filter: 50 },
                ],
            },
        });

        await new GridRows(api, 'filtered').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:3 row-number:"3" A:30 B:"="
            └── LEAF id:5 row-number:"5" A:50 B:""
        `);

        // Start editing B in row 3 (display index 0).
        const editingStarted = waitForEvent('cellEditingStarted', api);
        api.startEditingCell({ rowIndex: 0, colKey: 'B' });
        await editingStarted;
        await asyncSetTimeout(5);

        // Type "=A3:A5" — both endpoints are visible, row 4 in the middle is filtered out.
        const [editor] = api.getCellEditorInstances() as unknown as [{ agSetEditValue?: (v: unknown) => void }];
        editor?.agSetEditValue?.('=A3:A5');
        await asyncSetTimeout(10);

        // A range should be created spanning the display indices of rows 3 and 5.
        const ranges = api.getCellRanges() ?? [];
        const formulaRanges = ranges.filter((r) => r.startRow != null && r.endRow != null);
        expect(formulaRanges.length).toBeGreaterThan(0);

        const range = formulaRanges[0];
        // Display index 0 = row 3, display index 1 = row 5.
        const startDisplay = Math.min(range.startRow!.rowIndex, range.endRow!.rowIndex);
        const endDisplay = Math.max(range.startRow!.rowIndex, range.endRow!.rowIndex);
        expect(startDisplay).toBe(0);
        expect(endDisplay).toBe(1);

        api.stopEditing(true);
    });
});
