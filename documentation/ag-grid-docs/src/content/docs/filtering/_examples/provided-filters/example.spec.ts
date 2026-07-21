import { ensureGridReady, expect, test, waitForRowAnimations } from '@utils/grid/test-utils';

// Olympic data (olympic-winners.json, 8618 rows): row-id 0 is Michael Phelps
// (age 23, country United States, sport Swimming). The example suppresses the header menu
// button but each filterable column still shows a dedicated filter button in the header
// (total has filter:false, so no button).
//
// Cell reads only see virtualised (rendered) rows, so the authoritative check for each filter
// is the displayed row count from the grid API, which covers the whole filtered row model.
// The expected counts below are derived from the source dataset.
const EXPECTED = {
    athleteContainsFischer: 8,
    ageGreaterThan40: 121,
    countryUnitedStates: 1109,
    sportContainsSwimming: 596,
};

// Reads the visible text of every rendered cell in a column.
async function visibleColumnValues(page: any, colId: string): Promise<string[]> {
    const texts = await page.locator(`.ag-center-cols-container .ag-cell[col-id="${colId}"]`).allInnerTexts();
    return texts.map((t: string) => t.trim()).filter((t: string) => t.length > 0);
}

test.agExample(import.meta, () => {
    test.eachFramework(
        'Text Filter narrows the Athlete column to a contains match',
        async ({ page, agIdFor, remoteGrid }) => {
            await ensureGridReady(page);

            // Unfiltered, the first row is Michael Phelps.
            await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

            await agIdFor.headerFilterButton('athlete').click();
            const filterInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' }).first();
            await expect(filterInput).toBeVisible();
            await filterInput.fill('Fischer');
            await page.keyboard.press('Escape');
            await waitForRowAnimations(page);

            // The whole filtered row model matches, not just the rendered rows.
            await expect(async () => {
                expect(await remoteGrid(page).getDisplayedRowCount()).toBe(EXPECTED.athleteContainsFischer);
            }).toPass();

            // Michael Phelps (row-id 0) no longer passes the filter and every visible athlete matches.
            await expect(agIdFor.cell('0', 'athlete')).toHaveCount(0);
            const values = await visibleColumnValues(page, 'athlete');
            expect(values.length).toBeGreaterThan(0);
            for (const value of values) {
                expect(value).toContain('Fischer');
            }
        }
    );

    test.eachFramework(
        'Number Filter keeps only Ages greater than the entered value',
        async ({ page, agIdFor, remoteGrid }) => {
            await ensureGridReady(page);

            await expect(agIdFor.cell('0', 'age')).toContainText('23');

            await agIdFor.headerFilterButton('age').click();
            await agIdFor.filterInstancePickerDisplay({ source: 'column-filter' }).click();
            await page.getByText('Greater than', { exact: true }).click();
            await agIdFor.numberFilterInstanceInput({ source: 'column-filter' }).first().fill('40');
            await page.keyboard.press('Escape');
            await waitForRowAnimations(page);

            await expect(async () => {
                expect(await remoteGrid(page).getDisplayedRowCount()).toBe(EXPECTED.ageGreaterThan40);
            }).toPass();

            // Michael Phelps is 23, so row-id 0 is filtered out; every visible age is above 40.
            await expect(agIdFor.cell('0', 'age')).toHaveCount(0);
            const values = await visibleColumnValues(page, 'age');
            expect(values.length).toBeGreaterThan(0);
            for (const value of values) {
                expect(Number(value)).toBeGreaterThan(40);
            }
        }
    );

    test.eachFramework(
        'Set Filter restricts the Country column to a single selection',
        async ({ page, agIdFor, remoteGrid }) => {
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

            await expect(async () => {
                expect(await remoteGrid(page).getDisplayedRowCount()).toBe(EXPECTED.countryUnitedStates);
            }).toPass();

            // Every rendered country is United States.
            const values = await visibleColumnValues(page, 'country');
            expect(values.length).toBeGreaterThan(0);
            for (const value of values) {
                expect(value).toBe('United States');
            }
        }
    );

    test.eachFramework(
        'Multi Filter applies the Text sub-filter to the Sport column',
        async ({ page, agIdFor, remoteGrid }) => {
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
                expect(await remoteGrid(page).getDisplayedRowCount()).toBe(EXPECTED.sportContainsSwimming);
            }).toPass();

            const values = await visibleColumnValues(page, 'sport');
            expect(values.length).toBeGreaterThan(0);
            for (const value of values) {
                expect(value).toContain('Swimming');
            }
        }
    );
});
