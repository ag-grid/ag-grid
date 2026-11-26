import { AdvancedFilterHarness, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, LocaleModule, NumberFilterModule, TextFilterModule } from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

interface Row {
    athlete: string;
    age: number;
}

const GRID_OPTIONS: GridOptions<Row> = {
    columnDefs: [
        { field: 'athlete', filter: true },
        { field: 'age', filter: true },
    ],
    rowData: [{ athlete: 'Bolt', age: 25 }],
    enableAdvancedFilter: true,
};

describe('Advanced Filter - input placeholder', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, LocaleModule, TextFilterModule, NumberFilterModule, AdvancedFilterModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('the input shows a visible placeholder and keeps its accessible name', async () => {
        const api = await gridsManager.createGridAndWait('grid1', GRID_OPTIONS);
        await asyncSetTimeout(0);
        const { input } = AdvancedFilterHarness.get(api);

        expect(input.placeholder).toBe('Advanced Filter');
        expect(input.getAttribute('aria-label')).toBe('Advanced Filter Input');
    });

    test('the placeholder can be localised through localeText', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...GRID_OPTIONS,
            localeText: { advancedFilterPlaceholder: 'Filtre avancé' },
        });
        await asyncSetTimeout(0);

        expect(AdvancedFilterHarness.get(api).input.placeholder).toBe('Filtre avancé');
    });

    test('the placeholder is shown when the input renders in advancedFilterParent', async () => {
        const parent = document.createElement('div');
        document.body.appendChild(parent);

        await gridsManager.createGridAndWait('grid1', { ...GRID_OPTIONS, advancedFilterParent: parent });
        await asyncSetTimeout(0);

        const input = parent.querySelector<HTMLInputElement>('.ag-advanced-filter input[type=text]');
        expect(input?.placeholder).toBe('Advanced Filter');

        parent.remove();
    });
});
