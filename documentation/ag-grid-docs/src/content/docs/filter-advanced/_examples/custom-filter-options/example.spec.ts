import type { Page } from '@playwright/test';
import {
    clickHeaderToSort,
    ensureGridReady,
    expect,
    orderedValues,
    test,
    waitForGridContent,
} from '@utils/grid/test-utils';

const filterInput = (page: Page) => page.locator('.ag-advanced-filter input[type=text]');

/** Every rendered age, once the grid has settled on the applied expression. */
async function expectAges(page: Page, isOutsideFilter: (age: number) => boolean): Promise<void> {
    await expect(async () => {
        const cells = await orderedValues(page, 'age');
        expect(cells.length).toBeGreaterThan(0);
        // A blank cell would read as `Number('') === 0`, which satisfies the even check it should fail.
        expect(cells.filter((cell) => !/^\d+$/.test(cell))).toEqual([]);
        expect(cells.map(Number).filter(isOutsideFilter)).toEqual([]);
    }).toPass();
}

/** Types `expression`, closes the suggestion popup covering the buttons, then applies it. */
async function applyExpression(page: Page, expression: string): Promise<void> {
    await filterInput(page).fill(expression);
    await page.keyboard.press('Escape');
    await expect(page.locator('.ag-autocomplete-list-popup')).toBeHidden();
    await page.locator('.ag-advanced-filter-buttons').getByText('Apply').click();
}

test.agExample(import.meta, () => {
    test.eachFramework('should suggest the custom filter options for a column', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await filterInput(page).fill('[Age] ');

        // The whole list, so the narrowing the page describes is covered as well as the two options:
        // the column's list omits every built-in but `equals`.
        const autocompleteList = page.locator('.ag-autocomplete-list-popup');
        await expect(autocompleteList).toBeVisible();
        await expect(autocompleteList.locator('.ag-autocomplete-row')).toHaveText([
            '=',
            'Even Numbers',
            'Between (Exclusive)',
        ]);
    });

    test.eachFramework('should filter rows with zero-input and two-input custom options', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await applyExpression(page, '[Age] Even Numbers');
        await expectAges(page, (age) => age % 2 !== 0);

        await applyExpression(page, '[Age] Between (Exclusive) (25, 30)');
        await expectAges(page, (age) => age <= 25 || age >= 30);

        // The brackets are optional. A different range, so this cannot hold on the previous result.
        await applyExpression(page, '[Age] Between (Exclusive) 30, 35');
        await expectAges(page, (age) => age <= 30 || age >= 35);
    });

    test.eachFramework('should filter rows with the athlete zero-input and one-input options', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await applyExpression(page, '[Athlete] Starts With A');
        await expect(async () => {
            const athletes = await orderedValues(page, 'athlete');
            expect(athletes.length).toBeGreaterThan(0);
            expect(athletes.filter((athlete) => !athlete.startsWith('A'))).toEqual([]);
        }).toPass();

        await applyExpression(page, '[Athlete] Does Not Start With "A"');
        await expect(async () => {
            const athletes = await orderedValues(page, 'athlete');
            expect(athletes.length).toBeGreaterThan(0);
            expect(athletes.filter((athlete) => athlete.toLowerCase().startsWith('a'))).toEqual([]);
        }).toPass();
    });

    test.eachFramework('should filter the date column with its custom options', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await applyExpression(page, '[Date] Leap Year');
        await expect(async () => {
            const years = (await orderedValues(page, 'date')).map((date) => Number(date.split('-')[0]));
            expect(years.length).toBeGreaterThan(0);
            expect(years.filter((year) => year % 4 !== 0 || (year % 100 === 0 && year % 400 !== 0))).toEqual([]);
        }).toPass();

        // 2000 is the data's only century year, and a leap year by the 400 rule the naive `% 100` one drops.
        // Sorted ascending to bring it into the rendered rows, which are the only ones readable.
        await clickHeaderToSort(page.locator('.ag-header-cell[col-id="date"]'));
        await expect(async () => {
            const years = (await orderedValues(page, 'date')).map((date) => Number(date.split('-')[0]));
            expect(years[0]).toBe(2000);
        }).toPass();

        await applyExpression(page, '[Date] Between (Exclusive) ("2008-08-20", "2008-08-25")');
        await expect(async () => {
            const dates = await orderedValues(page, 'date');
            expect(dates.length).toBeGreaterThan(0);
            expect(dates.filter((date) => date <= '2008-08-20' || date >= '2008-08-25')).toEqual([]);
        }).toPass();
    });

    // A two-input condition is wider than the Builder, so its buttons are only reachable by scrolling.
    test.eachFramework('should keep a condition wider than the builder reachable', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await applyExpression(page, '[Date] Between (Exclusive) ("2008-08-20", "2008-08-25")');
        await page.getByRole('button', { name: 'Builder' }).click();

        const viewport = page.locator('.ag-advanced-filter-builder .ag-virtual-list-viewport');
        await expect(viewport).toBeVisible();
        const viewportBox = (await viewport.boundingBox())!;

        // Scrolled by wheel rather than `scrollIntoViewIfNeeded`, which also scrolls `overflow: hidden`
        // ancestors and so passes on a list the user cannot move at all.
        await page.mouse.move(viewportBox.x + viewportBox.width / 2, viewportBox.y + viewportBox.height / 2);
        await page.mouse.wheel(viewportBox.width, 0);

        const removeButton = page
            .locator('.ag-advanced-filter-builder-virtual-list-item', { hasText: 'Between (Exclusive)' })
            .getByRole('button', { name: 'Remove' });
        await expect(removeButton).toBeVisible();
        await expect(async () => {
            const buttonBox = (await removeButton.boundingBox())!;
            expect(buttonBox.x).toBeGreaterThanOrEqual(viewportBox.x);
            expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(viewportBox.x + viewportBox.width);
        }).toPass({ timeout: 5_000 });
    });
});
