import { ensureGridReady, expect, test } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);

        const gridApi = remoteGrid(page);
        const button = (name: string) => page.getByRole('button', { name, exact: true });
        const cardTitles = cardTitlesOf(page);

        // Initial cards are shown in the given order, and the Age filter is active.
        await expect(cardTitles).toHaveText(['Athlete', 'Age', 'Country']);
        const filteredRowCount = await gridApi.getDisplayedRowCount();
        expect(await gridApi.getColumnFilterModel('age')).not.toBeNull();

        // Remove Inactive Cards -> only the card with an applied filter remains.
        await button('Remove Inactive Cards').click();
        await expect(cardTitles).toHaveText(['Age']);
        expect(await gridApi.getColumnFilterModel('age')).not.toBeNull();

        // Show Athlete, Country, Year -> omitted Age card is removed and its filter is cleared.
        await button('Show Athlete, Country, Year').click();
        await expect(cardTitles).toHaveText(['Athlete', 'Country', 'Year']);
        expect(await gridApi.getColumnFilterModel('age')).toBeNull();
        await expect.poll(() => gridApi.getDisplayedRowCount()).toBeGreaterThan(filteredRowCount);

        // Reverse Order -> cards are listed in reverse.
        await button('Reverse Order').click();
        await expect(cardTitles).toHaveText(['Year', 'Country', 'Athlete']);

        // Remove Inactive Cards with no active filters -> every card is removed.
        await button('Remove Inactive Cards').click();
        await expect(cardTitles).toHaveText([]);

        // Show the cards again, then filter one of them: only the filtered card survives.
        await button('Show Athlete, Country, Year').click();
        await expect(cardTitles).toHaveText(['Athlete', 'Country', 'Year']);
        await gridApi.setFilterModel({ year: { filterType: 'number', type: 'equals', filter: 2008 } });
        await button('Remove Inactive Cards').click();
        await expect(cardTitles).toHaveText(['Year']);
        expect(await gridApi.getColumnFilterModel('year')).not.toBeNull();

        // Remove All Cards -> no cards, and the removed card's filter is cleared.
        await button('Remove All Cards').click();
        await expect(cardTitles).toHaveText([]);
        expect(await gridApi.getColumnFilterModel('year')).toBeNull();
        await expect.poll(() => gridApi.getDisplayedRowCount()).toBeGreaterThan(filteredRowCount);
    });
});

/** Locates the titles of the filter cards in the tool panel, in display order. */
function cardTitlesOf(page: Page) {
    return page.locator('.ag-filter-panel .ag-filter-card-title');
}
