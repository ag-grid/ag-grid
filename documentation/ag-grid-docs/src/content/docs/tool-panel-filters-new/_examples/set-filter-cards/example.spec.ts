import { ensureGridReady, expect, test } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);

        const gridApi = remoteGrid(page);
        const button = (name: string) => page.getByRole('button', { name, exact: true });
        const cardTitles = cardTitlesOf(page);

        await expect(cardTitles).toHaveText(['Athlete', 'Age', 'Country']);
        expect(await gridApi.getColumnFilterModel('age')).not.toBeNull();
        expect(await gridApi.getColumnFilterModel('country')).not.toBeNull();

        await button('Remove Inactive Cards').click();
        await expect(cardTitles).toHaveText(['Age', 'Country']);
        expect(await gridApi.getColumnFilterModel('age')).not.toBeNull();

        // Show Athlete, Country, Year -> omitted Age card is removed and its filter is cleared.
        await button('Show Athlete, Country, Year').click();
        await expect(cardTitles).toHaveText(['Athlete', 'Country', 'Year']);
        expect(await gridApi.getColumnFilterModel('age')).toBeNull();
        expect(await gridApi.getColumnFilterModel('country')).not.toBeNull();

        // Reverse Order -> cards are listed in reverse.
        await button('Reverse Order').click();
        await expect(cardTitles).toHaveText(['Year', 'Country', 'Athlete']);

        await button('Remove Inactive Cards').click();
        await expect(cardTitles).toHaveText(['Country']);

        await button('Remove All Cards').click();
        await expect(cardTitles).toHaveText([]);
        expect(await gridApi.getColumnFilterModel('country')).toBeNull();
    });
});

/** Locates the titles of the filter cards in the tool panel, in display order. */
function cardTitlesOf(page: Page) {
    return page.locator('.ag-filter-panel .ag-filter-card-title');
}
