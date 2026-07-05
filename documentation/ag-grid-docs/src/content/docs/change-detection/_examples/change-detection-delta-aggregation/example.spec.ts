import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom sum aggFunc aggregates the tree paths', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Top group column a = sum over j=1..5, k=1..3 of (j*k*863)%100 => 770.
        await expect(agIdFor.autoGroupCell('row-group-topGroup-Top')).toContainText('Top', { useInnerText: true });
        await expect(agIdFor.cell('row-group-topGroup-Top', 'a')).toContainText('770');

        // Sub-group Group A1 (Top, j=1) column a = 63+26+89 => 178.
        await expect(agIdFor.cell('row-group-topGroup-Top-group-Group A1', 'a')).toContainText('178');
    });

    test.eachFramework('Expanding a sub-group reveals its leaf rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Only the top level is expanded by default, so leaf row id 0 (a=63) is hidden.
        await expect(agIdFor.cell('0', 'a')).not.toBeVisible();
        await agIdFor.autoGroupContracted('row-group-topGroup-Top-group-Group A1').click();
        await expect(agIdFor.cell('0', 'a')).toContainText('63');
    });
});
