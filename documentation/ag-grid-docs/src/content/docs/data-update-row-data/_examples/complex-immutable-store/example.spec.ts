import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Top-level product groups render and expand to portfolios', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Every product in the source list becomes a top-level group
        const palmOil = agIdFor.rowNode('row-group-product-Palm Oil');
        await expect(palmOil).toBeVisible();
        await expect(agIdFor.autoGroupCell('row-group-product-Palm Oil')).toContainText('Palm Oil', {
            useInnerText: true,
        });

        // Portfolio sub-groups are hidden until the product group is expanded
        const aggressive = agIdFor.rowNode('row-group-product-Palm Oil-portfolio-Aggressive');
        await expect(aggressive).not.toBeVisible();

        await agIdFor.autoGroupContracted('row-group-product-Palm Oil').click();
        await expect(aggressive).toBeVisible();
        await expect(agIdFor.autoGroupCell('row-group-product-Palm Oil-portfolio-Aggressive')).toContainText(
            'Aggressive',
            { useInnerText: true }
        );
    });

    test.eachFramework('Updating row data preserves grid state', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Expand a group, then update the data
        await agIdFor.autoGroupContracted('row-group-product-Palm Oil').click();
        await expect(agIdFor.rowNode('row-group-product-Palm Oil-portfolio-Aggressive')).toBeVisible();

        await page.getByRole('button', { name: 'Update', exact: true }).click();
        await waitForGridContent(page);

        // The group is still present and remains expanded after the immutable update
        await expect(agIdFor.rowNode('row-group-product-Palm Oil')).toBeVisible();
        await expect(agIdFor.rowNode('row-group-product-Palm Oil-portfolio-Aggressive')).toBeVisible();
    });
});
