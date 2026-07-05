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
    test.eachFramework('Sort On / Sort Off applies and clears sort state', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Sort On', exact: true }).click();
        await expect(agIdFor.headerCell('age')).toHaveAttribute('aria-sort', 'descending');
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'ascending');

        await page.getByRole('button', { name: 'Sort Off', exact: true }).click();
        await expect(agIdFor.headerCell('age')).toHaveAttribute('aria-sort', 'none');
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'none');
    });

    test.eachFramework('Hide Cols / Show Cols toggles column visibility', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.headerCell('age')).toHaveCount(1);

        await page.getByRole('button', { name: 'Hide Cols', exact: true }).click();
        await expect(agIdFor.headerCell('age')).toHaveCount(0);
        await expect(agIdFor.headerCell('athlete')).toHaveCount(0);

        await page.getByRole('button', { name: 'Show Cols', exact: true }).click();
        await expect(agIdFor.headerCell('age')).toHaveCount(1);
        await expect(agIdFor.headerCell('athlete')).toHaveCount(1);
    });

    test.eachFramework('Reverse / Normal Medal Order reorders the medal columns', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        let order = await getHeaderColIds(page);
        expect(order.indexOf('gold')).toBeLessThan(order.indexOf('bronze'));

        await page.getByRole('button', { name: 'Reverse Medal Order', exact: true }).click();
        order = await getHeaderColIds(page);
        expect(order.indexOf('bronze')).toBeLessThan(order.indexOf('gold'));

        await page.getByRole('button', { name: 'Normal Medal Order', exact: true }).click();
        order = await getHeaderColIds(page);
        expect(order.indexOf('gold')).toBeLessThan(order.indexOf('bronze'));
    });

    test.eachFramework('Pinned On / Pinned Off pins and unpins columns', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Pinned On', exact: true }).click();
        await expect(page.locator('.ag-header-row .ag-grid-pinned-left-cells [col-id="athlete"]')).toHaveCount(1);
        await expect(page.locator('.ag-header-row .ag-grid-pinned-right-cells [col-id="sport"]')).toHaveCount(1);

        await page.getByRole('button', { name: 'Pinned Off', exact: true }).click();
        await expect(page.locator('.ag-header-row .ag-grid-pinned-left-cells [col-id="athlete"]')).toHaveCount(0);
        await expect(page.locator('.ag-header-row .ag-grid-pinned-right-cells [col-id="sport"]')).toHaveCount(0);
    });

    test.eachFramework('Row Group On groups rows by sport', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Row Group On', exact: true }).click();
        await expect(agIdFor.headerCell('ag-Grid-AutoColumn')).toHaveCount(1);
        await expect(agIdFor.autoGroupCell('row-group-sport-Swimming')).toContainText('Swimming', {
            useInnerText: true,
        });

        await page.getByRole('button', { name: 'Row Group Off', exact: true }).click();
        await expect(agIdFor.headerCell('ag-Grid-AutoColumn')).toHaveCount(0);
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
    });
});
