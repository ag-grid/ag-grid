import type { Page } from '@playwright/test';
import { type AgGridFixtures, expect, test } from '@utils/grid/test-utils';

const chooserItem = (page: Page, label: string) =>
    page.locator(`.ag-column-select-virtual-list-item[aria-label="${label}"]`);

const chooserItemLabels = (page: Page) =>
    page
        .locator('.ag-column-select-virtual-list-item')
        .evaluateAll((items) => items.map((item) => item.getAttribute('aria-label')));

const openChooser = async (page: Page, agIdFor: AgGridFixtures['agIdFor'], colId: string) => {
    await agIdFor.headerCell(colId).hover();
    await agIdFor.headerCellMenuButton(colId).click();
    await page.locator('.ag-menu-option-text', { hasText: 'Choose Columns' }).click();
};

const closeChooser = async (page: Page, agIdFor: AgGridFixtures['agIdFor']) => {
    await agIdFor.columnChooserCloseButton().click();
    await expect(page.locator('.ag-column-select-virtual-list-item')).toHaveCount(0);
};

// Drags a column header to the left of another column's header in the grid.
const moveColumnBefore = async (page: Page, agIdFor: AgGridFixtures['agIdFor'], colId: string, beforeColId: string) => {
    const from = (await agIdFor.headerCell(colId).boundingBox())!;
    const to = (await agIdFor.headerCell(beforeColId).boundingBox())!;
    const y = from.y + from.height / 2;
    await page.mouse.move(from.x + from.width / 2, y);
    await page.mouse.down();
    await page.mouse.move(from.x, y, { steps: 5 });
    await page.mouse.move(to.x + 5, y, { steps: 10 });
    await page.mouse.up();

    await expect(async () => {
        const moved = (await agIdFor.headerCell(colId).boundingBox())!;
        const target = (await agIdFor.headerCell(beforeColId).boundingBox())!;
        expect(moved.x).toBeLessThan(target.x);
    }).toPass();
};

test.agExample(import.meta, () => {
    test.eachFramework('Name column chooser uses the custom column layout', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // launch the column chooser from the Name column menu
        await agIdFor.headerCell('athlete').hover();
        await agIdFor.headerCellMenuButton('athlete').click();
        await page.locator('.ag-menu-option-text', { hasText: 'Choose Columns' }).click();

        // the custom layout renames the Athlete group to "Group 1"
        await expect(page.locator('.ag-column-select-column-label', { hasText: 'Group 1' })).toBeVisible();
        // and only includes sport, athlete and age (medals are omitted)
        await expect(page.locator('.ag-column-select-column-label', { hasText: 'Sport' })).toBeVisible();
        await expect(page.locator('.ag-column-select-column-label', { hasText: 'Gold' })).toHaveCount(0);
    });

    test.eachFramework('the custom layout lists its columns in the supplied order', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        await openChooser(page, agIdFor, 'athlete');
        await expect(chooserItem(page, 'Group 1 Column Group')).toBeVisible();

        // columnLayout order: sport, athlete ("Name"), age
        expect(await chooserItemLabels(page)).toEqual([
            'Group 1 Column Group',
            'Sport Column',
            'Name Column',
            'Age Column',
        ]);
    });

    test.eachFramework('a chooser without columnLayout reflects the live grid order', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // the Age column supplies no columnLayout, so the grid's own order is used
        await openChooser(page, agIdFor, 'age');
        await expect(chooserItem(page, 'Name Column')).toBeVisible();

        expect(await chooserItemLabels(page)).toEqual([
            'Athlete Column Group',
            'Name Column',
            'Age Column',
            'Sport Column',
            'Medals Column Group',
            'Gold Column',
            'Silver Column',
            'Bronze Column',
        ]);
    });

    test.eachFramework(
        'moving a grid column reorders the default chooser but not the custom layout',
        async ({ agIdFor, page }) => {
            await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

            await moveColumnBefore(page, agIdFor, 'age', 'athlete');

            // the Age chooser follows the grid, so Age now comes before Name
            await openChooser(page, agIdFor, 'age');
            await expect(chooserItem(page, 'Name Column')).toBeVisible();
            expect(await chooserItemLabels(page)).toEqual([
                'Athlete Column Group',
                'Age Column',
                'Name Column',
                'Sport Column',
                'Medals Column Group',
                'Gold Column',
                'Silver Column',
                'Bronze Column',
            ]);
            await closeChooser(page, agIdFor);

            // providing columnLayout implies suppressSyncLayoutWithGrid, so the Name chooser is unchanged
            await openChooser(page, agIdFor, 'athlete');
            await expect(chooserItem(page, 'Group 1 Column Group')).toBeVisible();
            expect(await chooserItemLabels(page)).toEqual([
                'Group 1 Column Group',
                'Sport Column',
                'Name Column',
                'Age Column',
            ]);
        }
    );

    test.eachFramework('Sport column chooser starts with the column groups contracted', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // contractColumnSelection=true on the Sport column
        await openChooser(page, agIdFor, 'sport');

        await expect(agIdFor.columnChooserListItemGroupClosedIcon('Athlete Column Group')).toBeVisible();
        await expect(agIdFor.columnChooserListItemGroupClosedIcon('Medals Column Group')).toBeVisible();
        expect(await chooserItemLabels(page)).toEqual(['Athlete Column Group', 'Medals Column Group']);

        // the groups still expand on demand
        await agIdFor.columnChooserListItemGroupClosedIcon('Medals Column Group').click();
        await expect(chooserItem(page, 'Gold Column')).toBeVisible();
    });
});
