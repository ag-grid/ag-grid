import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Groups the first 50 rows by country and expands to leaves', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // country is a row group; the first 50 Olympic rows contain 19 United States entries.
        await expect(agIdFor.autoGroupCell('row-group-country-United States')).toContainText('United States (19)', {
            useInnerText: true,
        });

        // groupDefaultExpanded: 1 leaves groups open, so the first leaf (Michael Phelps) is visible.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'total')).toContainText('8');

        // Collapsing the group hides its leaf rows.
        await agIdFor.autoGroupExpanded('row-group-country-United States').click();
        await expect(agIdFor.cell('0', 'athlete')).not.toBeVisible();
    });

    test.eachFramework('For-Each Leaf Node logs only data rows, For-Each Node logs groups', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const collectLogs = async (buttonText: string) => {
            const logs: string[] = [];
            const handler = (msg: { text: () => string }) => logs.push(msg.text());
            page.on('console', handler);
            await page.getByText(buttonText, { exact: true }).click();
            await page.waitForTimeout(300);
            page.off('console', handler);
            return logs;
        };

        // Leaf nodes are data rows only — no group entries.
        const leafLogs = await collectLogs('For-Each Leaf Node');
        expect(leafLogs.some((l) => l.includes('data: United States, Michael Phelps'))).toBe(true);
        expect(leafLogs.some((l) => l.includes('group:'))).toBe(false);

        // forEachNode walks every node, including the country group rows.
        const allLogs = await collectLogs('For-Each Node');
        expect(allLogs.some((l) => l.includes('group: United States'))).toBe(true);
    });
});
