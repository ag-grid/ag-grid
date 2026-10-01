import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('suppresses header buttons per column configuration', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'total')).toContainText('8');

        // athlete suppresses the header menu button
        await agIdFor.headerCell('athlete').hover();
        await expect(agIdFor.headerCellMenuButton('athlete')).toHaveCount(0);

        // country has a filter but suppresses the header filter button
        await agIdFor.headerCell('country').hover();
        await expect(agIdFor.headerFilterButton('country')).toHaveCount(0);
    });

    test.eachFramework('athlete menu is still available via right-click', async ({ agIdFor, page }) => {
        await agIdFor.headerCell('athlete').click({ button: 'right' });
        await expect(agIdFor.menu()).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });

    test.eachFramework('total suppresses the right-click menu', async ({ agIdFor }) => {
        await agIdFor.headerCell('total').click({ button: 'right' });
        await expect(agIdFor.menu()).toHaveCount(0);
    });

    test.eachFramework('age has a floating filter and a right-click-only menu', async ({ agIdFor, page }) => {
        // age: filter + floatingFilter + suppressHeaderMenuButton
        await expect(agIdFor.floatingFilter('age').locator('input').first()).toBeVisible();
        await agIdFor.headerCell('age').hover();
        await expect(agIdFor.headerCellMenuButton('age')).toHaveCount(0);

        await agIdFor.headerCell('age').click({ button: 'right' });
        await expect(agIdFor.menu()).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });

    test.eachFramework('year has a floating filter with the header filter button suppressed', async ({ agIdFor }) => {
        // year: filter + floatingFilter + suppressHeaderFilterButton
        await expect(agIdFor.floatingFilter('year').locator('input').first()).toBeVisible();
        await agIdFor.headerCell('year').hover();
        await expect(agIdFor.headerFilterButton('year')).toHaveCount(0);
        // the menu button is not suppressed on year
        await expect(agIdFor.headerCellMenuButton('year')).toBeVisible();
    });

    test.eachFramework('sport keeps the menu button but suppresses the right-click menu', async ({ agIdFor }) => {
        // sport: suppressHeaderContextMenu only
        await agIdFor.headerCell('sport').hover();
        await expect(agIdFor.headerCellMenuButton('sport')).toBeVisible();

        await agIdFor.headerCell('sport').click({ button: 'right' });
        await expect(agIdFor.menu()).toHaveCount(0);
    });

    test.eachFramework('gold suppresses both header buttons but stays right-clickable', async ({ agIdFor, page }) => {
        // gold: no filter, suppressHeaderMenuButton + suppressHeaderFilterButton
        await agIdFor.headerCell('gold').hover();
        await expect(agIdFor.headerCellMenuButton('gold')).toHaveCount(0);
        await expect(agIdFor.headerFilterButton('gold')).toHaveCount(0);

        await agIdFor.headerCell('gold').click({ button: 'right' });
        await expect(agIdFor.menu()).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });

    test.eachFramework('silver offers its filter inside the right-click menu', async ({ agIdFor, page }) => {
        // silver: filter + suppressHeaderMenuButton + suppressHeaderFilterButton, and no floating filter,
        // so the `columnFilter` default item is included in the menu
        await agIdFor.headerCell('silver').hover();
        await expect(agIdFor.headerCellMenuButton('silver')).toHaveCount(0);
        await expect(agIdFor.headerFilterButton('silver')).toHaveCount(0);
        // other columns enable floatingFilter, so every column renders a (here empty) floating filter
        // cell - silver's carries no filter input because it does not set floatingFilter
        await expect(agIdFor.floatingFilter('silver').locator('input')).toHaveCount(0);

        await agIdFor.headerCell('silver').click({ button: 'right' });
        await expect(agIdFor.menu()).toBeVisible();
        await expect(agIdFor.menuOption('Column Filter')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });

    test.eachFramework('bronze has a floating filter with both buttons suppressed', async ({ agIdFor, page }) => {
        // bronze: filter + floatingFilter + suppressHeaderMenuButton + suppressHeaderFilterButton
        await expect(agIdFor.floatingFilter('bronze').locator('input').first()).toBeVisible();
        await agIdFor.headerCell('bronze').hover();
        await expect(agIdFor.headerCellMenuButton('bronze')).toHaveCount(0);
        await expect(agIdFor.headerFilterButton('bronze')).toHaveCount(0);

        await agIdFor.headerCell('bronze').click({ button: 'right' });
        await expect(agIdFor.menu()).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });
});
