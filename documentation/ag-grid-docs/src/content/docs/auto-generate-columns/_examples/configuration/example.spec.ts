import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('objectValues group (default)', async ({ agIdFor, page }) => {
        // Default: address object renders as a column group
        const addressGroupHeader = page.locator('.ag-header-group-cell').filter({ hasText: 'Address' });
        await expect(addressGroupHeader).toBeVisible();
        await expect(agIdFor.headerCell('address.city')).toBeVisible();
        await expect(agIdFor.headerCell('address.country')).toBeVisible();
        // Array renders as comma-separated string
        await expect(agIdFor.cell('0', 'roles')).toContainText('admin');
        // Null field is included as a column
        await expect(agIdFor.headerCell('notes')).toBeVisible();
    });

    test.eachFramework('objectValues flatten', async ({ agIdFor, page }) => {
        // Wait for grid to be ready before triggering dropdown (module must be loaded)
        await expect(agIdFor.headerCell('name')).toBeVisible();
        await page.locator('#objectValues').selectOption('flatten');
        // No group header — address columns are flat leaf columns
        const addressGroupHeader = page.locator('.ag-header-group-cell').filter({ hasText: 'Address' });
        await expect(addressGroupHeader).not.toBeVisible();
        await expect(agIdFor.headerCell('address.city')).toBeVisible();
        await expect(agIdFor.headerCell('address.country')).toBeVisible();
    });

    test.eachFramework('objectValues skip', async ({ agIdFor, page }) => {
        await expect(agIdFor.headerCell('name')).toBeVisible();
        await page.locator('#objectValues').selectOption('skip');
        // Address columns are removed entirely
        const addressGroupHeader = page.locator('.ag-header-group-cell').filter({ hasText: 'Address' });
        await expect(addressGroupHeader).not.toBeVisible();
        await expect(agIdFor.headerCell('address.city')).not.toBeVisible();
        await expect(agIdFor.headerCell('address.country')).not.toBeVisible();
        // Other columns unaffected
        await expect(agIdFor.headerCell('name')).toBeVisible();
        await expect(agIdFor.headerCell('roles')).toBeVisible();
    });

    test.eachFramework('arrayValues skip', async ({ agIdFor, page }) => {
        await expect(agIdFor.headerCell('roles')).toBeVisible();
        await page.locator('#arrayValues').selectOption('skip');
        await expect(agIdFor.headerCell('roles')).not.toBeVisible();
        // Other columns unaffected
        await expect(agIdFor.headerCell('name')).toBeVisible();
    });

    test.eachFramework('arrayValues include', async ({ agIdFor, page }) => {
        await expect(agIdFor.headerCell('roles')).toBeVisible();
        await page.locator('#arrayValues').selectOption('include');
        // roles column still present (same as primitives for this data)
        await expect(agIdFor.headerCell('roles')).toBeVisible();
    });

    test.eachFramework('nullishValues skip', async ({ agIdFor, page }) => {
        await expect(agIdFor.headerCell('notes')).toBeVisible();
        await page.locator('#nullishValues').selectOption('skip');
        // notes column (null value) is removed
        await expect(agIdFor.headerCell('notes')).not.toBeVisible();
        // Other columns unaffected
        await expect(agIdFor.headerCell('name')).toBeVisible();
    });

    test.eachFramework('nullishValues include (default)', async ({ agIdFor }) => {
        // notes column is present with nullishValues=include (default)
        await expect(agIdFor.headerCell('notes')).toBeVisible();
    });
});
