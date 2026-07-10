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
});
