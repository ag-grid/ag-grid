import { ensureGridReady, expect, test, waitForRowAnimations } from '@utils/grid/test-utils';

// Olympic data: row-id 0 is Michael Phelps (age 23, country United States, sport Swimming).
// The example suppresses the header menu button but each filterable column still shows a
// dedicated filter button in the header (total has filter:false, so no button).

// Reads the visible text of every rendered cell in a column.
async function visibleColumnValues(page: any, colId: string): Promise<string[]> {
    const texts = await page.locator(`.ag-center-cols-container .ag-cell[col-id="${colId}"]`).allInnerTexts();
    return texts.map((t: string) => t.trim()).filter((t: string) => t.length > 0);
}

test.agExample(import.meta, () => {
    test.eachFramework('Text Filter narrows the Athlete column to a contains match', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        // Unfiltered, the first row is Michael Phelps.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        await agIdFor.headerFilterButton('athlete').click();
        const filterInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' }).first();
        await expect(filterInput).toBeVisible();
        await filterInput.fill('Fischer');
        await page.keyboard.press('Escape');
        await waitForRowAnimations(page);

        // Michael Phelps (row-id 0) no longer passes the filter and every visible athlete matches.
        await expect(agIdFor.cell('0', 'athlete')).toHaveCount(0);
        await expect(async () => {
            const values = await visibleColumnValues(page, 'athlete');
            expect(values.length).toBeGreaterThan(0);
            for (const value of values) {
                expect(value).toContain('Fischer');
            }
        }).toPass();
    });

    test.eachFramework('Number Filter keeps only Ages greater than the entered value', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        await expect(agIdFor.cell('0', 'age')).toContainText('23');

        await agIdFor.headerFilterButton('age').click();
        await agIdFor.filterInstancePickerDisplay({ source: 'column-filter' }).click();
        await page.getByText('Greater than', { exact: true }).click();
        await agIdFor.numberFilterInstanceInput({ source: 'column-filter' }).first().fill('40');
        await page.keyboard.press('Escape');
        await waitForRowAnimations(page);

        // Michael Phelps is 23, so row-id 0 is filtered out; every visible age is above 40.
        await expect(agIdFor.cell('0', 'age')).toHaveCount(0);
        await expect(async () => {
            const values = await visibleColumnValues(page, 'age');
            expect(values.length).toBeGreaterThan(0);
            for (const value of values) {
                expect(Number(value)).toBeGreaterThan(40);
            }
        }).toPass();
    });

    test.eachFramework('Set Filter restricts the Country column to a single selection', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        await agIdFor.headerFilterButton('country').click();

        // Deselect everything, then narrow the list and select United States only.
        const selectAll = page
            .locator('.ag-set-filter')
            .first()
            .locator('.ag-set-filter-item')
            .filter({ hasText: '(Select All)' })
            .first();
        await expect(selectAll).toBeVisible();
        await selectAll.click();

        await agIdFor.setFilterInstanceMiniFilterInput({ source: 'column-filter' }).fill('United States');
        const usItem = agIdFor.setFilterInstanceItem({ source: 'column-filter' }, 'United States');
        await expect(usItem).toBeVisible();
        await usItem.click();
        await page.keyboard.press('Escape');
        await waitForRowAnimations(page);

        // Only United States rows remain.
        await expect(async () => {
            const values = await visibleColumnValues(page, 'country');
            expect(values.length).toBeGreaterThan(0);
            for (const value of values) {
                expect(value).toBe('United States');
            }
        }).toPass();
    });

    test.eachFramework('Multi Filter applies the Text sub-filter to the Sport column', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');

        await agIdFor.headerFilterButton('sport').click();
        // The Multi Filter shows the Text Filter first.
        const textInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' }).first();
        await expect(textInput).toBeVisible();
        await textInput.fill('Swimming');
        await page.keyboard.press('Escape');
        await waitForRowAnimations(page);

        await expect(async () => {
            const values = await visibleColumnValues(page, 'sport');
            expect(values.length).toBeGreaterThan(0);
            for (const value of values) {
                expect(value).toContain('Swimming');
            }
        }).toPass();
    });
});
