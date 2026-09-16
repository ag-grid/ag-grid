import type { Page } from '@playwright/test';
import { expect, test } from '@utils/grid/test-utils';

const chooserItem = (page: Page, label: string) =>
    page.locator(`.ag-column-select-virtual-list-item[aria-label="${label}"]`);

const chooserItemLabels = (page: Page) =>
    page
        .locator('.ag-column-select-virtual-list-item')
        .evaluateAll((items) => items.map((item) => item.getAttribute('aria-label')));

test.agExample(import.meta, () => {
    test.eachFramework('Name column chooser hides the select/filter widgets', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // launch the column chooser from the Name column menu
        await agIdFor.headerCell('athlete').hover();
        await agIdFor.headerCellMenuButton('athlete').click();
        await page.locator('.ag-menu-option-text', { hasText: 'Choose Columns' }).click();

        // the column chooser lists the grid columns
        await expect(page.locator('.ag-column-select-column-label', { hasText: 'Gold' })).toBeVisible();

        // suppressColumnSelectAll / suppressColumnFilter / suppressColumnExpandAll
        // hide the header widget panel
        await expect(page.locator('.ag-column-select-header')).toHaveClass(/ag-hidden/);
    });

    test.eachFramework(
        'Name column chooser hides the filter, select-all and expand-all controls individually',
        async ({ agIdFor, page }) => {
            await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

            await agIdFor.headerCell('athlete').hover();
            await agIdFor.headerCellMenuButton('athlete').click();
            await page.locator('.ag-menu-option-text', { hasText: 'Choose Columns' }).click();

            await expect(page.locator('.ag-column-select-column-label', { hasText: 'Gold' })).toBeVisible();

            // suppressColumnFilter
            await expect(page.locator('.ag-column-select-header-filter-wrapper')).toHaveClass(/ag-hidden/);
            // suppressColumnSelectAll
            await expect(page.locator('.ag-column-select-header-checkbox')).toHaveClass(/ag-hidden/);
            // suppressColumnExpandAll
            await expect(page.locator('.ag-column-select-header-icon')).toHaveClass(/ag-hidden/);
        }
    );

    test.eachFramework(
        'a chooser without the suppressions shows the controls and expands/collapses groups',
        async ({ agIdFor, page }) => {
            await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

            // the Gold column sets no columnChooserParams of its own
            await agIdFor.headerCell('gold').hover();
            await agIdFor.headerCellMenuButton('gold').click();
            await page.locator('.ag-menu-option-text', { hasText: 'Choose Columns' }).click();

            // the header widget panel and its three controls are all shown
            await expect(page.locator('.ag-column-select-header')).not.toHaveClass(/ag-hidden/);
            await expect(page.locator('.ag-column-select-header-filter-wrapper')).not.toHaveClass(/ag-hidden/);
            await expect(page.locator('.ag-column-select-header-checkbox')).not.toHaveClass(/ag-hidden/);
            await expect(page.locator('.ag-column-select-header-icon')).not.toHaveClass(/ag-hidden/);

            // groups start expanded and collapse/expand normally
            const medalsGroup = chooserItem(page, 'Medals Column Group');
            await expect(chooserItem(page, 'Gold Column')).toBeVisible();

            await medalsGroup.locator('.ag-column-group-opened-icon').click();
            await expect(chooserItem(page, 'Gold Column')).toHaveCount(0);

            await agIdFor.columnChooserListItemGroupClosedIcon('Medals Column Group').click();
            await expect(chooserItem(page, 'Gold Column')).toBeVisible();
        }
    );

    test.eachFramework('Age column chooser starts with the column groups contracted', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // contractColumnSelection=true on the Age column
        await agIdFor.headerCell('age').hover();
        await agIdFor.headerCellMenuButton('age').click();
        await page.locator('.ag-menu-option-text', { hasText: 'Choose Columns' }).click();

        await expect(agIdFor.columnChooserListItemGroupClosedIcon('Athlete Column Group')).toBeVisible();
        await expect(agIdFor.columnChooserListItemGroupClosedIcon('Medals Column Group')).toBeVisible();
        // the children of the contracted groups are not listed
        await expect(chooserItem(page, 'Gold Column')).toHaveCount(0);
        await expect(chooserItem(page, 'Name Column')).toHaveCount(0);

        // contrast: the Gold column's chooser opens with the groups expanded
        await agIdFor.columnChooserCloseButton().click();
        await expect(page.locator('.ag-column-select-virtual-list-item')).toHaveCount(0);

        await agIdFor.headerCell('gold').hover();
        await agIdFor.headerCellMenuButton('gold').click();
        await page.locator('.ag-menu-option-text', { hasText: 'Choose Columns' }).click();

        await expect(chooserItem(page, 'Gold Column')).toBeVisible();
        await expect(chooserItem(page, 'Name Column')).toBeVisible();
        await expect(agIdFor.columnChooserListItemGroupClosedIcon('Medals Column Group')).not.toBeVisible();
    });

    test.eachFramework(
        'suppressSyncLayoutWithGrid keeps the chooser layout after a grid column move',
        async ({ agIdFor, page }) => {
            await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

            await agIdFor.headerCell('gold').hover();
            await agIdFor.headerCellMenuButton('gold').click();
            await page.locator('.ag-menu-option-text', { hasText: 'Choose Columns' }).click();

            await expect(chooserItem(page, 'Name Column')).toBeVisible();
            const before = await chooserItemLabels(page);
            expect(before).toEqual([
                'Athlete Column Group',
                'Name Column',
                'Age Column',
                'Medals Column Group',
                'Gold Column',
                'Silver Column',
                'Bronze Column',
            ]);

            await agIdFor.columnChooserCloseButton().click();
            await expect(page.locator('.ag-column-select-virtual-list-item')).toHaveCount(0);

            // drag Age to the left of Name in the grid
            const ageBox = (await agIdFor.headerCell('age').boundingBox())!;
            const nameBox = (await agIdFor.headerCell('athlete').boundingBox())!;
            const y = ageBox.y + ageBox.height / 2;
            await page.mouse.move(ageBox.x + ageBox.width / 2, y);
            await page.mouse.down();
            await page.mouse.move(ageBox.x, y, { steps: 5 });
            await page.mouse.move(nameBox.x + 5, y, { steps: 10 });
            await page.mouse.up();

            // the grid order really did change
            await expect(async () => {
                const age = (await agIdFor.headerCell('age').boundingBox())!;
                const name = (await agIdFor.headerCell('athlete').boundingBox())!;
                expect(age.x).toBeLessThan(name.x);
            }).toPass();

            // but the chooser layout is unchanged because suppressSyncLayoutWithGrid=true
            await agIdFor.headerCell('gold').hover();
            await agIdFor.headerCellMenuButton('gold').click();
            await page.locator('.ag-menu-option-text', { hasText: 'Choose Columns' }).click();

            await expect(chooserItem(page, 'Name Column')).toBeVisible();
            expect(await chooserItemLabels(page)).toEqual(before);
        }
    );
});
