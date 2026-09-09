import { bench, suite } from 'vitest';

import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, TextFilterModule, getGridElement } from 'ag-grid-community';
import { AdvancedFilterModule, ColumnMenuModule, ContextMenuModule, SetFilterModule } from 'ag-grid-enterprise';

import { BenchGridsManager, SimplePRNG, benchCooldown, benchDefaults } from './bench-utils';

const ROW_COUNT = 20_000;

const columnDefs: ColDef[] = [
    { field: 'country', filter: 'agSetColumnFilter' },
    { field: 'code', filter: 'agSetColumnFilter' },
];

function buildRowData(): { code: string; country: string }[] {
    const prng = new SimplePRNG(0x12345678);
    const countries: string[] = [];
    for (let i = 0; i < 250; ++i) {
        countries.push(prng.nextString(10));
    }
    const rowData: { code: string; country: string }[] = [];
    for (let r = 0; r < ROW_COUNT; ++r) {
        rowData.push({ code: `code-${r}`, country: countries[r % countries.length] });
    }
    return rowData;
}

const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;

function typeInto(input: HTMLInputElement, text: string): void {
    valueSetter.call(input, text);
    input.selectionStart = text.length;
    input.selectionEnd = text.length;
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

async function waitFor<T>(get: () => T | null | undefined): Promise<T> {
    for (let i = 0; i < 200; ++i) {
        const found = get();
        if (found) {
            return found;
        }
        await new Promise((resolve) => setTimeout(resolve, 10));
    }
    throw new Error('element never appeared');
}

/**
 * The Advanced Filter value autocomplete against the Set Filter's own mini filter, on the same column.
 * `code` holds one distinct value per row, which is the worst the value list can be asked to do.
 */
suite('advanced filter set values vs set filter mini filter', () => {
    const gridsManager = new BenchGridsManager({
        modules: [
            ClientSideRowModelModule,
            TextFilterModule,
            SetFilterModule,
            AdvancedFilterModule,
            ColumnMenuModule,
            ContextMenuModule,
        ],
    });

    const rowData = buildRowData();

    let expressionInput: HTMLInputElement;
    let miniFilter: HTMLInputElement;

    // Both grids are built once and kept: rebuilding 20 000 rows per bench would dominate the keystroke
    // being measured, and the comparison needs the two built the same way. The cooldown is still taken.
    const setUpExpression = async () => {
        await benchCooldown();
        if (expressionInput) {
            return;
        }
        const api = gridsManager.createGrid('advanced', { columnDefs, rowData, enableAdvancedFilter: true });
        expressionInput = await waitFor(() =>
            getGridElement(api)!.querySelector<HTMLInputElement>('.ag-advanced-filter input[type=text]')
        );
    };

    const setUpMiniFilter = async () => {
        await benchCooldown();
        if (miniFilter) {
            return;
        }
        const api = gridsManager.createGrid('set', { columnDefs, rowData });
        api.showColumnFilter('code');
        miniFilter = await waitFor(() =>
            document.querySelector<HTMLInputElement>('.ag-filter-menu .ag-mini-filter input')
        );
    };

    // The value list is built once and cached, so this measures reopening it, not the build.
    bench(
        `advanced filter: reopen the value list (${ROW_COUNT} distinct)`,
        () => {
            typeInto(expressionInput, '');
            typeInto(expressionInput, '[Code] is any of [');
        },
        { ...benchDefaults(), setup: setUpExpression }
    );

    bench(
        `advanced filter: keystroke matching every value (${ROW_COUNT})`,
        () => {
            typeInto(expressionInput, '[Code] is any of [cod');
            typeInto(expressionInput, '[Code] is any of [code');
        },
        { ...benchDefaults(), setup: setUpExpression }
    );

    bench(
        'advanced filter: keystroke narrowing to a handful',
        () => {
            typeInto(expressionInput, '[Code] is any of [code-1999');
            typeInto(expressionInput, '[Code] is any of [code-19999');
        },
        { ...benchDefaults(), setup: setUpExpression }
    );

    bench(
        `set filter mini filter: keystroke matching every value (${ROW_COUNT})`,
        () => {
            typeInto(miniFilter, 'cod');
            typeInto(miniFilter, 'code');
        },
        { ...benchDefaults(), setup: setUpMiniFilter }
    );

    bench(
        'set filter mini filter: keystroke narrowing to a handful',
        () => {
            typeInto(miniFilter, 'code-1999');
            typeInto(miniFilter, 'code-19999');
        },
        { ...benchDefaults(), setup: setUpMiniFilter }
    );
});
