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
    const texts = await page.locator(`.ag-grid-scrolling-container .ag-cell[col-id="${colId}"]`).allInnerTexts();
    return texts.map((t: string) => t.trim()).filter((t: string) => t.length > 0);
}

// The displayed row count (grid API) settles before the viewport finishes repainting the filtered
// rows, so a one-shot DOM read can catch an empty viewport. Poll the read and its assertions until
// the rendered cells have caught up.
async function expectVisibleColumnValues(
    page: any,
    colId: string,
    assertValue: (value: string) => void
): Promise<void> {
    await expect(async () => {
        const values = await visibleColumnValues(page, colId);
        expect(values.length).toBeGreaterThan(0);
        for (const value of values) {
            assertValue(value);
        }
    }).toPass();
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
            await expectVisibleColumnValues(page, 'athlete', (value) => expect(value).toContain('Fischer'));
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
            await expectVisibleColumnValues(page, 'age', (value) => expect(Number(value)).toBeGreaterThan(40));
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
            await expectVisibleColumnValues(page, 'country', (value) => expect(value).toBe('United States'));
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

            await expectVisibleColumnValues(page, 'sport', (value) => expect(value).toContain('Swimming'));
        }
    );
    // AG-18364: the filter popup is shrink-to-fit around its text input, and an input's
    // max-content contribution includes its horizontal padding. The search-icon and clear-button
    // gutters are both `icon-size + spacing * 2`, so before the fix the popup width tracked
    // `--ag-icon-size` and had grown 32px wider than 36.1.0. The input now carries a definite
    // width, so the gutters eat into the text area instead of widening the popup.
    //
    // Perturbing `--ag-icon-size` is the assertion that actually fails on the unfixed build
    // (+48px at 40px icons); comparing an empty vs a filled input does not, because the gutters
    // are reserved regardless of the value.
    test.eachFramework('Text Filter popup width does not track the icon gutters', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const popup = page.locator('.ag-menu:not(.ag-tabs) .ag-filter').first();

        const openAndMeasure = async (): Promise<number> => {
            await agIdFor.headerFilterButton('athlete').click();
            await expect(popup).toBeVisible();
            const box = await popup.boundingBox();
            expect(box).not.toBeNull();
            const width = box!.width;
            await page.keyboard.press('Escape');
            await expect(popup).toBeHidden();
            return width;
        };

        const baseline = await openAndMeasure();

        // Tolerance window, not an exact value: the popup width is theme-coupled (it carries the
        // widget container padding and the theme spacing). Wide enough to survive a theme tweak,
        // narrow enough to catch the 32px regression this test exists for.
        expect(baseline).toBeGreaterThan(190);
        expect(baseline).toBeLessThan(230);

        // Triple the icon size: on the unfixed build this widens the popup by 2 * (40 - 16).
        await page.addStyleTag({ content: '.ag-root-wrapper { --ag-icon-size: 40px; }' });

        const perturbed = await openAndMeasure();
        expect(Math.abs(perturbed - baseline)).toBeLessThanOrEqual(1);
    });
});
