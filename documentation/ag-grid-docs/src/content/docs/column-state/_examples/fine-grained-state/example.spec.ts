import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

/** Returns col-ids of the centre header cells, ordered by aria-colindex. */
async function getHeaderColIds(page: import('playwright/test').Page) {
    return page.evaluate(() => {
        const cells = document.querySelectorAll('.ag-header-row .ag-header-cell');
        return Array.from(cells)
            .sort(
                (a, b) =>
                    parseInt(a.getAttribute('aria-colindex') || '0') - parseInt(b.getAttribute('aria-colindex') || '0')
            )
            .map((c) => c.getAttribute('col-id'));
    });
}

test.agExample(import.meta, () => {
    test.eachFramework('Sort buttons apply and clear sort state', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Sort Athlete' }).click();
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'ascending');

        await page.getByRole('button', { name: 'Clear All Sorting' }).click();
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'none');
    });

    test.eachFramework('Show Medals First / Last reorders columns', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        let order = await getHeaderColIds(page);
        expect(order.indexOf('athlete')).toBeLessThan(order.indexOf('gold'));

        await page.getByRole('button', { name: 'Show Medals First' }).click();
        order = await getHeaderColIds(page);
        expect(order.indexOf('gold')).toBeLessThan(order.indexOf('athlete'));

        await page.getByRole('button', { name: 'Show Medals Last' }).click();
        order = await getHeaderColIds(page);
        expect(order.indexOf('athlete')).toBeLessThan(order.indexOf('gold'));
    });

    test.eachFramework('Hide Medals / Show Medals toggles medal column visibility', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.headerCell('gold')).toHaveCount(1);

        await page.getByRole('button', { name: 'Hide Medals', exact: true }).click();
        await expect(agIdFor.headerCell('gold')).toHaveCount(0);

        await page.getByRole('button', { name: 'Show Medals', exact: true }).click();
        await expect(agIdFor.headerCell('gold')).toHaveCount(1);
    });

    test.eachFramework(
        'Group Country then Sport groups rows and Clear All Groups undoes it',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            await page.getByRole('button', { name: 'Group Country then Sport' }).click();
            await expect(agIdFor.headerCell('ag-Grid-AutoColumn')).toHaveCount(1);
            await expect(agIdFor.autoGroupCell('row-group-country-United States')).toContainText('United States', {
                useInnerText: true,
            });

            await page.getByRole('button', { name: 'Clear All Groups' }).click();
            await expect(agIdFor.headerCell('ag-Grid-AutoColumn')).toHaveCount(0);
            await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        }
    );
});
