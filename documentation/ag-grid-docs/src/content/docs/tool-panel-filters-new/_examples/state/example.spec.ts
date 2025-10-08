import { expect, test } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

import type { NewFiltersToolPanelState } from 'ag-grid-community';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page, agIdFor, remoteGrid }) => {
        // test that the initial state has been applied to the filters tool panel
        await runTestLogic(agIdFor, remoteGrid, page);
    });
});

test.agExample(import.meta, () => {
    [
        { prod: true, version: '19.1.0' },
        { prod: false, version: '19.1.0' },
        { prod: true, version: '19.2.0' },
        { prod: false, version: '19.2.0' },
        { prod: true, version: '18.2.0' },
        { prod: false, version: '18.2.0' },
    ].forEach((configOptions) => {
        test.describe(`Example with config: ${JSON.stringify(configOptions)}`, () => {
            test.use({ loadPageOptions: configOptions });

            test.reactFunctionalTs(`Example`, async ({ page, remoteGrid, agIdFor, loadPageOptions }) => {
                expect(loadPageOptions?.version).toEqual(configOptions.version);
                expect(loadPageOptions?.prod).toEqual(configOptions.prod);

                await runTestLogic(agIdFor, remoteGrid, page);
            });
        });
    });
});

async function runTestLogic(agIdFor: any, remoteGrid: any, page: Page) {
    const gridApi = remoteGrid(page);

    const filterToolPanel = agIdFor.filterToolPanel();
    await expect(filterToolPanel).toBeVisible();

    const countryFilter = filterToolPanel.getByRole('button', { name: 'Country' });
    await expect(countryFilter).toHaveAttribute('aria-expanded', 'true');

    const ageFilter = filterToolPanel.getByRole('button', { name: 'Age is (All)' });
    await expect(ageFilter).toHaveAttribute('aria-expanded', 'false');

    // validate order of filters in tool panel
    // count the number of ag-filter-card components
    const filterCards = filterToolPanel.locator('.ag-filter-card');
    // 2 cards and 1 add
    await expect(filterCards).toHaveCount(3);
    await expect(filterCards.nth(0).getByRole('button', { name: 'Country' })).toBeVisible();
    await expect(filterCards.nth(1).getByRole('button', { name: 'Age is (All)' })).toBeVisible();

    await gridApi.setState({
        sideBar: {
            visible: true,
            position: 'right',
            openToolPanel: 'filters-new',
            toolPanels: {
                'filters-new': {
                    filters: [
                        {
                            colId: 'total',
                            expanded: true,
                        },
                        {
                            colId: 'country',
                            expanded: false,
                        },
                    ],
                } as NewFiltersToolPanelState,
            },
        },
    });

    const totalFilter = filterToolPanel.getByRole('button', { name: 'Total' });
    await expect(totalFilter).toHaveAttribute('aria-expanded', 'true');

    await expect(filterCards).toHaveCount(3);
    await expect(filterCards.nth(0).getByRole('button', { name: 'Total' })).toBeVisible();
    await expect(filterCards.nth(1).getByRole('button', { name: 'Country' })).toBeVisible();

    // next update the columns so that one of the filters is not valid so that it should be removed.
    await gridApi.setGridOption('columnDefs', [
        { field: 'athlete' },
        { field: 'age' },
        { field: 'date', minWidth: 180 },
        { field: 'total' },
    ]);

    await expect(filterCards).toHaveCount(2);
    await expect(filterCards.nth(0).getByRole('button', { name: 'Total' })).toBeVisible();

    // then update the filter model to add filter state for a new column and an existing sidebar filter
    await gridApi.setFilterModel({
        total: {
            type: 'greaterThan',
            filter: 20,
        },
        age: {
            type: 'lessThan',
            filter: 25,
        },
    });

    await expect(filterCards).toHaveCount(3);
    await expect(filterCards.nth(0).getByRole('button', { name: 'Total' })).toBeVisible();
    await expect(filterCards.nth(1).getByRole('button', { name: 'Age < 25' })).toBeVisible();

    // then update the filter model to clear the filter state for a column which should not remove the filter from the panel
    await gridApi.setFilterModel({
        total: {
            type: 'greaterThan',
            filter: 20,
        },
    });
    await expect(filterCards).toHaveCount(3);
    await expect(filterCards.nth(0).getByRole('button', { name: 'Total' })).toBeVisible();
    await expect(filterCards.nth(1).getByRole('button', { name: 'Age is (All)' })).toBeVisible();

    // Clear the filter panel state, which should also remove the filters from the filter model
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

    // should only have the add card
    await expect(filterCards).toHaveCount(1);
}
