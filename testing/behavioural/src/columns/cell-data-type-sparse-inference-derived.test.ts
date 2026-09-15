import '@testing-library/jest-dom/vitest';
import { userEvent } from '@testing-library/user-event';
import { TestGridsManager, waitForInput } from 'ag-test-utils';

import type { ColDef, GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    NumberEditorModule,
    NumberFilterModule,
    TextEditorModule,
    TextFilterModule,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

interface Row {
    country?: string;
    year?: number | null;
    date?: string | null;
}

// A type inferred from a sparse column must drive every derived behaviour - editor, filter,
// formatter, parser, grouping and aggregation - exactly as an explicit declaration does.
describe('derived behaviour of a sparsely inferred cellDataType', () => {
    const gridsManager = new TestGridsManager({
        includeDefaultModules: true,
        modules: [
            ClientSideRowModelModule,
            RowGroupingModule,
            NumberEditorModule,
            TextEditorModule,
            NumberFilterModule,
            TextFilterModule,
            DateFilterModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const DERIVED_PROPS = [
        'cellDataType',
        'cellEditor',
        'cellRenderer',
        'comparator',
        'filter',
        'getFindText',
        'keyCreator',
        'suppressKeyboardEvent',
        'valueFormatter',
        'valueParser',
    ] as const satisfies readonly (keyof ColDef)[];

    const derivedProps = (api: GridApi, colId: string) => {
        const colDef = api.getColumn(colId)!.getColDef() as Record<string, unknown>;
        const props: Record<string, unknown> = {};
        for (let i = 0, len = DERIVED_PROPS.length; i < len; ++i) {
            props[DERIVED_PROPS[i]] = colDef[DERIVED_PROPS[i]];
        }
        return props;
    };

    // `inferred` has no value in row 0, `explicit` declares the same type it should end up inferring
    const createParityGrid = (rowData: Row[], cellDataType: string) =>
        gridsManager.createGrid('grid', {
            columnDefs: [
                { colId: 'inferred', field: 'year' },
                { colId: 'explicit', field: 'year', cellDataType },
            ],
            rowData,
        });

    test.each([
        ['number', [{ year: null }, { year: 2000 }, { year: 2001 }]],
        ['text', [{ year: null }, { year: 'a' }, { year: 'b' }] as unknown as Row[]],
    ])('a sparsely inferred %s column matches an explicit declaration', (cellDataType, rowData) => {
        const api = createParityGrid(rowData as Row[], cellDataType);

        expect(derivedProps(api, 'inferred')).toEqual(derivedProps(api, 'explicit'));
    });

    test('the inferred filter and value formatter apply to a dateString column', async () => {
        const api = gridsManager.createGrid('grid', {
            columnDefs: [
                { colId: 'inferred', field: 'date' },
                { colId: 'explicit', field: 'date', cellDataType: 'dateString' },
            ],
            rowData: [{ date: null }, { date: '2020-06-01' }],
            defaultColDef: { filter: true },
        });

        expect(derivedProps(api, 'inferred')).toEqual(derivedProps(api, 'explicit'));

        const dateRow = api.getDisplayedRowAtIndex(1)!;

        expect(api.getCellValue({ rowNode: dateRow, colKey: 'inferred', useFormatter: true })).toBe(
            api.getCellValue({ rowNode: dateRow, colKey: 'explicit', useFormatter: true })
        );

        await api.setColumnFilterModel('inferred', { filterType: 'date', type: 'greaterThan', dateFrom: '2020-01-01' });
        api.onFilterChanged();

        expect(api.getDisplayedRowCount()).toBe(1);
    });

    test('the inferred value parser is used when a cell is edited', async () => {
        const rowData: Row[] = [{ year: null }, { year: 2000 }];
        const api = await gridsManager.createGridAndWait('grid', {
            columnDefs: [{ field: 'year', editable: true }],
            rowData,
        });
        const user = userEvent.setup();

        const gridElement = getGridElement(api)! as HTMLElement;
        const cell = gridElement.querySelector<HTMLElement>('[row-index="1"] [col-id="year"]')!;
        await user.dblClick(cell);
        const input = await waitForInput(gridElement, cell);
        await user.clear(input);
        await user.type(input, '2001');
        await user.keyboard('{Enter}');

        // the number parser returns a number, the fallback text type would leave a string
        expect(rowData[1].year).toBe(2001);
    });

    test('cellEditorParams min/max are honoured on a sparsely inferred number column', async () => {
        const rowData: Row[] = [{ year: null }, { year: 2000 }];
        const api = await gridsManager.createGridAndWait('grid', {
            columnDefs: [{ field: 'year', editable: true, cellEditorParams: { min: 1900, max: 2100 } }],
            rowData,
        });
        const user = userEvent.setup();

        const gridElement = getGridElement(api)! as HTMLElement;
        const cell = gridElement.querySelector<HTMLElement>('[row-index="1"] [col-id="year"]')!;
        await user.dblClick(cell);
        const input = await waitForInput(gridElement, cell);
        await user.clear(input);
        await user.type(input, '9999');
        await user.keyboard('{Enter}');

        expect(rowData[1].year).toBe(2000);
    });

    test('grouping by a sparsely inferred column keys rows the same as an explicit declaration', () => {
        const rowData: Row[] = [{ year: null }, { year: 2000 }, { year: 2000 }, { year: 2001 }];
        const api = gridsManager.createGrid('grid', {
            columnDefs: [{ field: 'year', rowGroup: true }],
            rowData,
        });

        const groupKeys: (string | null)[] = [];
        api.forEachNode((node) => {
            if (node.group) {
                groupKeys.push(node.key);
            }
        });

        expect(groupKeys).toEqual(['2000', '2001', '']);
    });

    test('aggregating a sparsely inferred number column sums numerically', () => {
        const api = gridsManager.createGrid('grid', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'year', aggFunc: 'sum' },
            ],
            rowData: [
                { country: 'a', year: null },
                { country: 'a', year: 2000 },
                { country: 'a', year: 1 },
            ],
        });

        const groupNode = api.getDisplayedRowAtIndex(0)!;

        expect(groupNode.aggData.year).toBe(2001);
    });

    test('a type inferred from transaction-added rows drives the derived behaviour', async () => {
        const api = gridsManager.createGrid('grid', {
            columnDefs: [{ colId: 'inferred', field: 'year' }],
            rowData: [],
            defaultColDef: { filter: true },
        });

        api.applyTransaction({ add: [{ year: null }, { year: 2000 }] });

        expect(api.getColumn('inferred')!.getColDef().cellDataType).toBe('number');

        await api.setColumnFilterModel('inferred', { filterType: 'number', type: 'greaterThan', filter: 1999 });
        api.onFilterChanged();

        expect(api.getDisplayedRowCount()).toBe(1);
    });
});
