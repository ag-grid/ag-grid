import { userEvent } from '@testing-library/user-event';
import { TestGridsManager, waitForInput } from 'ag-test-utils';

import type { ColDef, GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    NumberEditorModule,
    TextEditorModule,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';

interface PersonRow {
    athlete: string;
    age: number;
    editable: boolean;
}

const columnDefs: ColDef<PersonRow>[] = [
    { field: 'athlete', editable: (params) => !!params.data?.editable },
    { field: 'age', editable: (params) => !!params.data?.editable },
];

const rowData: PersonRow[] = [
    { athlete: 'Alice', age: 23, editable: false },
    { athlete: 'Bob', age: 40, editable: false },
    { athlete: 'Carol', age: 31, editable: true },
];

describe('Conditional editing reverse tab navigation', () => {
    const gridsManager = new TestGridsManager({
        includeDefaultModules: true,
        modules: [ClientSideRowModelModule, NumberEditorModule, TextEditorModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridsManager.reset();
        vi.clearAllMocks();
    });

    const cell = (api: GridApi, rowIndex: number, colId: string): HTMLElement =>
        (getGridElement(api)! as HTMLElement).querySelector<HTMLElement>(
            `[row-index="${rowIndex}"] [col-id="${colId}"]`
        )!;

    test('Shift+Tab out of the only editable cell moves focus to the last header cell', async () => {
        const user = userEvent.setup();
        const api = await gridsManager.createGridAndWait('ag-16759-a', { columnDefs, rowData });

        await user.dblClick(cell(api, 2, 'athlete'));
        await waitForInput(cell(api, 2, 'athlete'));

        await user.keyboard('{Shift>}{Tab}{/Shift}');

        const active = document.activeElement as HTMLElement;
        expect(active?.classList.contains('ag-header-cell')).toBe(true);
        expect(active?.getAttribute('col-id')).toBe('age');
    });

    test('Repeated Shift+Tab up into the header throws no error', async () => {
        const errors: unknown[] = [];
        const onError = (e: ErrorEvent) => errors.push(e.error ?? e.message);
        window.addEventListener('error', onError);
        try {
            const user = userEvent.setup();
            const api = await gridsManager.createGridAndWait('ag-16759-b', { columnDefs, rowData });

            await user.dblClick(cell(api, 2, 'athlete'));
            await waitForInput(cell(api, 2, 'athlete'));

            for (let i = 0; i < 8; i++) {
                await user.keyboard('{Shift>}{Tab}{/Shift}');
            }

            expect(errors).toHaveLength(0);
        } finally {
            window.removeEventListener('error', onError);
        }
    });
});
