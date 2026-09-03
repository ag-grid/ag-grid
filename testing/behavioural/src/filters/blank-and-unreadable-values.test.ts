import { GridRows, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { AdvancedFilterModel, ColumnAdvancedFilterModel, GridApi } from 'ag-grid-community';
import {
    BigIntFilterModule,
    ClientSideRowModelModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
} from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

/**
 * The three states a cell can be in, for every provided filter and both filter engines. Missing (`null`,
 * `undefined`, empty or whitespace-only) answers `blank`, and only the matching `includeBlanksIn*` admits it to a
 * comparison. Unreadable (present, but not the column's type) answers `notBlank`, is excluded from every
 * comparison except a negation, and no param can reach it. Readable is compared.
 *
 * Sibling-less by design: the rule spans `scalarFilterHandler`, `bigIntFilterHandler`, `textFilterHandler`,
 * `filterExpressionOperators` and `advancedFilterExpressionService`, so no one module owns it. Every case here is
 * also a row of AG-18279's acceptance table, which is why the answers are pinned rather than only the agreement.
 */
describe('Blank and unreadable values', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            NumberFilterModule,
            BigIntFilterModule,
            DateFilterModule,
            TextFilterModule,
            AdvancedFilterModule,
            ClientSideRowModelModule,
        ],
    });

    afterEach(() => gridsManager.reset());

    const ROWS = {
        number: [
            { id: 'A', value: 0 },
            { id: 'B', value: 7 },
            { id: 'C', value: '' },
            { id: 'D', value: '   ' },
            { id: 'E', value: null },
        ],
        bigint: [
            { id: 'A', value: 0 },
            { id: 'B', value: '0' },
            { id: 'C', value: 0n },
            { id: 'D', value: 7 },
            { id: 'E', value: '' },
        ],
        date: [
            { id: 'A', value: '2024-01-10' },
            { id: 'B', value: '2024-06-01' },
            { id: 'C', value: '' },
            { id: 'D', value: null },
            { id: 'E', value: 'not a date' },
        ],
        text: [
            { id: 'A', value: 'abc' },
            { id: 'B', value: 'xyz' },
            { id: 'C', value: '' },
            { id: 'D', value: '   ' },
            { id: 'E', value: null },
        ],
    };

    const COLUMN: Record<string, { cellDataType: string; filter: string }> = {
        number: { cellDataType: 'number', filter: 'agNumberColumnFilter' },
        bigint: { cellDataType: 'bigint', filter: 'agBigIntColumnFilter' },
        date: { cellDataType: 'dateString', filter: 'agDateColumnFilter' },
        text: { cellDataType: 'text', filter: 'agTextColumnFilter' },
    };

    function displayedIds(api: GridApi): string {
        const ids: string[] = [];
        for (let i = 0; i < api.getDisplayedRowCount(); i++) {
            ids.push(api.getDisplayedRowAtIndex(i)!.data!.id);
        }
        return ids.join(' ');
    }

    /**
     * The rows each engine shows for one condition. Returning both in one object makes a failure say which
     * engine broke, and asserting them together pins the answer rather than only that the two agree.
     */
    async function bothEngines(
        kind: keyof typeof ROWS,
        model: object,
        filterParams: object = {}
    ): Promise<{ columnFilter: string; advancedFilter: string }> {
        const { cellDataType, filter } = COLUMN[kind];
        const columnDefs = [{ field: 'id' }, { field: 'value', cellDataType, filter, filterParams }] as any;
        const rowData = ROWS[kind];

        const columnFilterApi: GridApi = await gridsManager.createGridAndWait('columnFilterGrid', {
            columnDefs,
            rowData,
        });
        await columnFilterApi.setColumnFilterModel('value', { filterType: kind, ...model });
        columnFilterApi.onFilterChanged();
        await asyncSetTimeout(0);
        const columnFilter = displayedIds(columnFilterApi);
        columnFilterApi.destroy();

        const { type, filter: operand, dateFrom } = model as any;
        const advancedFilterModel: ColumnAdvancedFilterModel = {
            filterType: kind === 'date' ? 'dateString' : kind,
            colId: 'value',
            type,
            ...(operand !== undefined ? { filter: operand } : {}),
            ...(dateFrom !== undefined ? { filter: dateFrom } : {}),
        } as ColumnAdvancedFilterModel;

        const advancedFilterApi: GridApi = await gridsManager.createGridAndWait('advancedFilterGrid', {
            columnDefs,
            rowData,
            enableAdvancedFilter: true,
        });
        advancedFilterApi.setAdvancedFilterModel(advancedFilterModel as AdvancedFilterModel);
        advancedFilterApi.onFilterChanged();
        await asyncSetTimeout(0);
        const advancedFilter = displayedIds(advancedFilterApi);
        advancedFilterApi.destroy();

        return { columnFilter, advancedFilter };
    }

    /** Both engines show exactly `expected`. */
    function shows(expected: string) {
        return { columnFilter: expected, advancedFilter: expected };
    }

    // A=0 B=7 C='' D='   ' E=null
    test('a number column reads an empty or whitespace cell as missing, not as zero', async () => {
        expect(await bothEngines('number', { type: 'blank' })).toEqual(shows('C D E'));
        expect(await bothEngines('number', { type: 'notBlank' })).toEqual(shows('A B'));

        // The zero row is the discriminator: a blank that coerced to 0 would join every one of these.
        expect(await bothEngines('number', { type: 'equals', filter: 0 })).toEqual(shows('A'));
        expect(await bothEngines('number', { type: 'notEqual', filter: 0 })).toEqual(shows('B'));
        expect(await bothEngines('number', { type: 'lessThan', filter: 5 })).toEqual(shows('A'));
        expect(await bothEngines('number', { type: 'greaterThan', filter: -5 })).toEqual(shows('A B'));

        const includeEquals = { includeBlanksInEquals: true };
        expect(await bothEngines('number', { type: 'equals', filter: 0 }, includeEquals)).toEqual(shows('A C D E'));
        const includeLessThan = { includeBlanksInLessThan: true };
        expect(await bothEngines('number', { type: 'lessThan', filter: 5 }, includeLessThan)).toEqual(shows('A C D E'));
        const includeNotEqual = { includeBlanksInNotEqual: true };
        expect(await bothEngines('number', { type: 'notEqual', filter: 0 }, includeNotEqual)).toEqual(shows('B C D E'));
    });

    // A='2024-01-10' B='2024-06-01' C='' D=null E='not a date'
    test('a date column separates a missing date from one it cannot read', async () => {
        expect(await bothEngines('date', { type: 'blank' })).toEqual(shows('C D'));
        // E is present and unreadable, so it is not blank, and no `includeBlanksIn*` below reaches it.
        expect(await bothEngines('date', { type: 'notBlank' })).toEqual(shows('A B E'));

        expect(await bothEngines('date', { type: 'equals', dateFrom: '2024-01-10' })).toEqual(shows('A'));
        // `notEqual` is the one comparison an unreadable value passes: it equals nothing.
        expect(await bothEngines('date', { type: 'notEqual', dateFrom: '2024-01-10' })).toEqual(shows('B E'));

        const includeNotEqual = { includeBlanksInNotEqual: true };
        expect(await bothEngines('date', { type: 'notEqual', dateFrom: '2024-01-10' }, includeNotEqual)).toEqual(
            shows('B C D E')
        );
        const includeLessThan = { includeBlanksInLessThan: true };
        expect(await bothEngines('date', { type: 'lessThan', dateFrom: '2024-06-01' }, includeLessThan)).toEqual(
            shows('A C D')
        );
    });

    // A=0 (number) B='0' (string) C=0n (bigint) D=7 (number) E=''
    test('a bigint column compares the same number however the row data writes it', async () => {
        // `0n === 0` is false, so comparing the cell value unparsed would match C alone.
        expect(await bothEngines('bigint', { type: 'equals', filter: '0' })).toEqual(shows('A B C'));
        expect(await bothEngines('bigint', { type: 'notEqual', filter: '0' })).toEqual(shows('D'));
        expect(await bothEngines('bigint', { type: 'blank' })).toEqual(shows('E'));
    });

    // A='abc' B='xyz' C='' D='   ' E=null
    test('a text column counts an empty value as blank but still matches it as text', async () => {
        expect(await bothEngines('text', { type: 'blank' })).toEqual(shows('C D E'));
        expect(await bothEngines('text', { type: 'notBlank' })).toEqual(shows('A B'));

        // Unlike a scalar, text keeps an empty string as a value: C and D are matchable, and reach `notEqual`.
        expect(await bothEngines('text', { type: 'contains', filter: 'abc' })).toEqual(shows('A'));
        expect(await bothEngines('text', { type: 'notEqual', filter: 'abc' })).toEqual(shows('B C D E'));
    });

    /**
     * `number`, `bigint` and `date` call an empty or whitespace value invalid where `dateString`, `text`,
     * `boolean` and `object` show nothing, so the three states are pinned per type.
     */
    test('each cell data type displays the three states as follows', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'num', cellDataType: 'number' },
                { field: 'big', cellDataType: 'bigint' },
                { field: 'dat', cellDataType: 'date' },
                { field: 'dstr', cellDataType: 'dateString' },
                { field: 'txt', cellDataType: 'text' },
                { field: 'bool', cellDataType: 'boolean' },
                { field: 'obj', cellDataType: 'object', valueFormatter: ({ value }) => String(value ?? '') },
            ],
            rowData: [
                { num: '', big: '', dat: '', dstr: '', txt: '', bool: '', obj: '' },
                { num: '   ', big: '   ', dat: '   ', dstr: '   ', txt: '   ', bool: '   ', obj: '   ' },
                { num: null, big: null, dat: null, dstr: null, txt: null, bool: null, obj: null },
            ],
        });

        await new GridRows(api, 'blank display per data type').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 num:"Invalid Number" big:"Invalid BigInt" dat:"Invalid Date" dstr:"" txt:"" bool:"" obj:""
            ├── LEAF id:1 num:"Invalid Number" big:"Invalid BigInt" dat:"Invalid Date" dstr:"" txt:"   " bool:"   " obj:"   "
            └── LEAF id:2 num:null big:null dat:null dstr:null txt:null bool:null obj:null
        `);
    });

    // `dateTimeString` inherits `dateString`'s treatment: an unreadable value shows nothing, not a name.
    test('a date-string cell shows nothing for a value the parser rejects', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'str', cellDataType: 'dateString' },
                { field: 'strTime', cellDataType: 'dateTimeString' },
            ],
            rowData: [
                { str: '2024-01-10', strTime: '2024-01-10 09:30:00' },
                { str: 'not a date', strTime: 'not a date' },
            ],
        });

        await new GridRows(api, 'date-string cell display').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 str:"2024-01-10" strTime:"2024-01-10 09:30:00"
            └── LEAF id:1 str:"" strTime:""
        `);
    });
});
