import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('groups by a nested object field via valueGetter', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        const groupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        // Country is a complex object { name, code }; the valueGetter 'data.country.name'
        // means groups display the plain country name, not "[object Object]".
        await expect(agIdFor.autoGroupCell('0')).toContainText('United States', { useInnerText: true });
        await expect(agIdFor.autoGroupCell('0')).not.toContainText('[object Object]', { useInnerText: true });

        // Aggregated medal totals are computed server-side for the group.
        await expect(agIdFor.cell('0', 'gold')).toContainText('552');
        await expect(groupRow('Russia')).toBeVisible();
    });
});
