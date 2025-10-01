import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Column Moving Button Operations', async ({ page, agIdFor }) => {
        // Set a consistent viewport size
        await page.setViewportSize({ width: 1200, height: 800 });

        // Helper function to get column order using aria-colindex
        async function getColumnHeadersOrdered() {
            const headers = await page.evaluate(() => {
                const headerCells = document.querySelectorAll('.ag-header-cell');
                return Array.from(headerCells)
                    .map((cell) => ({
                        text: cell.textContent?.trim(),
                        colIndex: parseInt(cell.getAttribute('aria-colindex') || '0'),
                    }))
                    .sort((a, b) => a.colIndex - b.colIndex)
                    .map((col) => col.text);
            });
            return headers;
        }

        // Wait for initial render
        await page.waitForSelector('.ag-header-cell');

        // Verify initial column order
        const initialOrder = await getColumnHeadersOrdered();
        expect(initialOrder).toEqual([
            'Athlete',
            'Age',
            'Country',
            'Year',
            'Date',
            'Sport',
            'Gold',
            'Silver',
            'Bronze',
            'Total',
        ]);

        // Test "Medals First" button
        await page.locator('button:text("Medals First")').click();
        const medalsFirstOrder = await getColumnHeadersOrdered();
        expect(medalsFirstOrder).toEqual([
            'Gold',
            'Silver',
            'Bronze',
            'Total',
            'Athlete',
            'Age',
            'Country',
            'Year',
            'Date',
            'Sport',
        ]);

        // Test "Medals Last" button
        await page.locator('button:text("Medals Last")').click();
        const medalsLastOrder = await getColumnHeadersOrdered();
        expect(medalsLastOrder).toEqual([
            'Athlete',
            'Age',
            'Country',
            'Year',
            'Date',
            'Sport',
            'Gold',
            'Silver',
            'Bronze',
            'Total',
        ]);

        // Test "Country First" button
        await page.locator('button:text("Country First")').click();
        const countryFirstOrder = await getColumnHeadersOrdered();
        expect(countryFirstOrder).toEqual([
            'Country',
            'Athlete',
            'Age',
            'Year',
            'Date',
            'Sport',
            'Gold',
            'Silver',
            'Bronze',
            'Total',
        ]);

        // Test "Swap First Two" button
        await page.locator('button:text("Swap First Two")').click();
        const swappedOrder = await getColumnHeadersOrdered();
        expect(swappedOrder).toEqual([
            'Athlete',
            'Country',
            'Age',
            'Year',
            'Date',
            'Sport',
            'Gold',
            'Silver',
            'Bronze',
            'Total',
        ]);
    });
});
