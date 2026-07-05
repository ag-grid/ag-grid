import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Country groups are sorted ascending', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // country has sort: 'asc', so Afghanistan (alphabetically first) sits at the top.
        const afghanistan = agIdFor.autoGroupCell('row-group-country-Afghanistan');
        await expect(afghanistan).toContainText('Afghanistan', { useInnerText: true });
        await expect(agIdFor.rowNode('row-group-country-Afghanistan')).toHaveAttribute('row-index', '0');
    });

    test.eachFramework('Expanding a country group reveals its leaf rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Afghanistan's two medals belong to Rohullah Nikpai (data rows 1829 and 1855).
        await expect(agIdFor.cell('1829', 'athlete')).not.toBeVisible();
        await agIdFor.autoGroupContracted('row-group-country-Afghanistan').click();
        await expect(agIdFor.cell('1829', 'athlete')).toContainText('Rohullah Nikpai');
    });
});
