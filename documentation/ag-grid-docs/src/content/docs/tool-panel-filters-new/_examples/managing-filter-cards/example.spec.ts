import { ensureGridReady, expect, test } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

import type { NewFiltersToolPanelState } from 'ag-grid-community';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await runTestLogic(remoteGrid, page);
    });

    test.eachFramework('Card buttons', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);

        const gridApi = remoteGrid(page);
        const button = (name: string) => page.getByRole('button', { name, exact: true });
        const cardTitles = cardTitlesLocator(page);
        const expectExpanded = expectExpandedFor(page);

        await expect(cardTitles).toHaveText(['Athlete', 'Age', 'Country']);
        await expectExpanded({ Athlete: false, Age: false, Country: true });

        await button('Expand All').click();
        await expectExpanded({ Athlete: true, Age: true, Country: true });

        await button('Collapse All').click();
        await expectExpanded({ Athlete: false, Age: false, Country: false });

        await button('Remove Inactive').click();
        await expect(cardTitles).toHaveText(['Age', 'Country']);
        expect(await gridApi.getColumnFilterModel('age')).not.toBeNull();

        // Age is omitted, so its card is removed and its filter cleared; Year is added collapsed
        await button('Expand All').click();
        await button('Show Athlete, Country, Year').click();
        await expect(cardTitles).toHaveText(['Athlete', 'Country', 'Year']);
        await expectExpanded({ Athlete: false, Country: true, Year: false });
        expect(await gridApi.getColumnFilterModel('age')).toBeNull();
        expect(await gridApi.getColumnFilterModel('country')).not.toBeNull();

        // clearing the filter model clears the values but leaves the cards in place
        await button('Clear Filter Values').click();
        await expect(cardTitles).toHaveText(['Athlete', 'Country', 'Year']);
        expect(await gridApi.getColumnFilterModel('country')).toBeNull();

        await button('Remove Inactive').click();
        await expect(cardTitles).toHaveText([]);

        await button('Restore Initial State').click();
        await expect(cardTitles).toHaveText(['Athlete', 'Age', 'Country']);
        await expectExpanded({ Athlete: false, Age: false, Country: true });
        expect(await gridApi.getColumnFilterModel('age')).not.toBeNull();

        await button('Remove All').click();
        await expect(cardTitles).toHaveText([]);
        expect(await gridApi.getColumnFilterModel('age')).toBeNull();
        expect(await gridApi.getColumnFilterModel('country')).toBeNull();
    });

    test.eachFramework('State buttons', async ({ page, agIdFor, remoteGrid }) => {
        await ensureGridReady(page);

        const gridApi = remoteGrid(page);
        const button = (name: string) => page.getByRole('button', { name, exact: true });
        const cardTitles = cardTitlesLocator(page);

        // the buttons only change the filter and Side Bar state, so the sort must survive every one of them
        const athleteHeader = agIdFor.headerCell('athlete');
        await athleteHeader.getByText('Athlete').click();
        await expect(athleteHeader).toHaveAttribute('aria-sort', 'ascending');

        await button('Show Athlete, Country, Year').click();
        await expect(cardTitles).toHaveText(['Athlete', 'Country', 'Year']);
        await button('Save State').click();

        await button('Remove All').click();
        await expect(cardTitles).toHaveText([]);
        expect(await gridApi.getColumnFilterModel('country')).toBeNull();

        // a saved state restores both the cards and their filter values
        await button('Restore Saved State').click();
        await expect(cardTitles).toHaveText(['Athlete', 'Country', 'Year']);
        expect(await gridApi.getColumnFilterModel('country')).not.toBeNull();
        expect(await gridApi.getColumnFilterModel('age')).toBeNull();

        await expect(athleteHeader).toHaveAttribute('aria-sort', 'ascending');
    });
});

test.agExample(import.meta, () => {
    [
        { prod: true, version: '19.1.1' },
        { prod: false, version: '19.1.1' },
        { prod: true, version: '19.2.1' },
        { prod: false, version: '19.2.1' },
        { prod: true, version: '18.2.0' },
        { prod: false, version: '18.2.0' },
    ].forEach((configOptions) => {
        test.describe(`Example with config: ${JSON.stringify(configOptions)}`, () => {
            test.use({ loadPageOptions: configOptions });

            test.reactFunctionalTs(`Example`, async ({ page, remoteGrid, loadPageOptions }) => {
                expect(loadPageOptions?.version).toEqual(configOptions.version);
                expect(loadPageOptions?.prod).toEqual(configOptions.prod);

                await runTestLogic(remoteGrid, page);
            });
        });
    });
});

async function runTestLogic(remoteGrid: any, page: Page) {
    const gridApi = remoteGrid(page);
    const cardTitles = cardTitlesLocator(page);
    const expectExpanded = expectExpandedFor(page);

    // the initial state sets the cards, their order and expansion
    await expect(cardTitles).toHaveText(['Athlete', 'Age', 'Country']);
    await expectExpanded({ Athlete: false, Age: false, Country: true });

    // clear the initial filters first, as an active filter adds its card back to the tool panel
    await gridApi.setFilterModel(null);
    await expect(cardTitles).toHaveText(['Athlete', 'Age', 'Country']);

    await gridApi.setState({
        sideBar: {
            visible: true,
            position: 'right',
            openToolPanel: 'filters-new',
            toolPanels: {
                'filters-new': {
                    filters: [
                        { colId: 'total', expanded: true },
                        { colId: 'country', expanded: false },
                    ],
                } as NewFiltersToolPanelState,
            },
        },
    });

    await expect(cardTitles).toHaveText(['Total', 'Country']);
    await expectExpanded({ Total: true, Country: false });

    // removing a column removes its card
    await gridApi.setGridOption('columnDefs', [
        { field: 'athlete' },
        { field: 'age', filter: 'agNumberColumnFilter' },
        { field: 'year', filter: 'agNumberColumnFilter' },
        { field: 'total', filter: 'agNumberColumnFilter' },
    ]);
    await expect(cardTitles).toHaveText(['Total']);

    // setting a filter for a column without a card adds one
    await gridApi.setFilterModel({
        total: { filterType: 'number', type: 'greaterThan', filter: 20 },
        age: { filterType: 'number', type: 'lessThan', filter: 25 },
    });
    await expect(cardTitles).toHaveText(['Total', 'Age']);

    // clearing a filter leaves its card in place
    await gridApi.setFilterModel({
        total: { filterType: 'number', type: 'greaterThan', filter: 20 },
    });
    await expect(cardTitles).toHaveText(['Total', 'Age']);

    // clearing the tool panel state removes every card, and their filters
    await gridApi.setState({
        sideBar: {
            visible: true,
            position: 'right',
            openToolPanel: 'filters-new',
            toolPanels: {
                'filters-new': {
                    filters: [],
                } as NewFiltersToolPanelState,
            },
        },
    });
    await expect(cardTitles).toHaveText([]);
    expect(await gridApi.getColumnFilterModel('total')).toBeNull();
}

function cardTitlesLocator(page: Page) {
    return page.locator('.ag-filter-panel .ag-filter-card-title');
}

/** Asserts the expanded state of filter cards, keyed by their displayed title. */
function expectExpandedFor(page: Page) {
    const panel = page.locator('.ag-filter-panel');
    return async (expected: Record<string, boolean>) => {
        for (const [name, expanded] of Object.entries(expected)) {
            const cardExpand = panel.locator('.ag-filter-card-expand').filter({
                has: page.locator('.ag-filter-card-title', { hasText: new RegExp(`^${name}$`) }),
            });
            await expect(cardExpand).toHaveAttribute('aria-expanded', String(expanded));
        }
    };
}
