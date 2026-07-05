import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('renders the fetched space-mission data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'mission')).toContainText('CRS SpX-25');
        await expect(agIdFor.cell('0', 'company')).toContainText('SpaceX');
    });

    test.eachFramework('filtering the mission column narrows the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Open the mission column filter and search for the single "CRS SpX-25" mission.
        await agIdFor.headerFilterButton('mission').click();
        const filterInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' });
        await filterInput.fill('CRS SpX-25');
        await filterInput.press('Enter');

        // Only the one matching row remains; the second-row mission is filtered out.
        await expect(agIdFor.cell('0', 'mission')).toContainText('CRS SpX-25');
        await expect(agIdFor.rowNode('1')).toHaveCount(0);
    });
});
