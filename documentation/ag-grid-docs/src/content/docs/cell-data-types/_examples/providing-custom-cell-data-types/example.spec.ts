import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // colIds: 'athlete', 'countryObject' (Country), 'sportObject' (Sport), 'date'.
    // Row 0 = Michael Phelps, United States, Swimming, 24/08/2008 (olympic-winners.json).
    //
    // None of the columns set `cellDataType` explicitly, so the custom 'country', 'sport'
    // and overridden 'dateString' definitions can only be in play if `dataTypeMatcher`
    // inferred them from the row data. Every assertion below therefore also exercises
    // inference.

    test.eachFramework('custom data types format the complex object columns', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        // 'country' valueFormatter renders value.code.
        await expect(agIdFor.cell('0', 'countryObject')).toContainText('United States');
        // 'sport' valueFormatter renders value.name.
        await expect(agIdFor.cell('0', 'sportObject')).toContainText('Swimming');
    });

    test.eachFramework('the date column parses the non-standard dd/MM/yyyy format', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const dateCell = agIdFor.cell('0', 'date');
        await expect(dateCell).toContainText('24/08/2008');

        // The displayed text alone would not prove anything — the source data is already
        // '24/08/2008' and a plain text column would render it unchanged. Opening the editor
        // does prove it: the column only gets a date editor because dataTypeMatcher inferred
        // the custom 'dateString' type, and the editor's ISO value is what dateParser made of
        // the dd/MM/yyyy source string.
        await dateCell.dblclick();
        const editor = dateCell.locator('input[type="date"]');
        await expect(editor).toBeVisible();
        await expect(editor).toHaveValue('2008-08-24');

        // Committing a new date runs it back through dateFormatter, which re-serialises to
        // the non-standard dd/MM/yyyy form rather than the built-in ISO one.
        await editor.fill('2003-02-01');
        await page.keyboard.press('Enter');
        await expect(editor).toHaveCount(0);

        await expect(dateCell).toContainText('01/02/2003');
    });

    test.eachFramework(
        'the country valueParser stores an object built from the typed text',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            const countryCell = agIdFor.cell('0', 'countryObject');
            await countryCell.dblclick();
            const editor = countryCell.locator('input');
            await expect(editor).toBeVisible();
            await editor.fill('France');
            await page.keyboard.press('Enter');
            await expect(editor).toHaveCount(0);

            // valueParser wraps the text as { code: 'France' }; the formatter reads .code back out.
            await expect(countryCell).toContainText('France');
        }
    );

    test.eachFramework(
        'the sport valueParser stores an object built from the typed text',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            const sportCell = agIdFor.cell('0', 'sportObject');
            await sportCell.dblclick();
            const editor = sportCell.locator('input');
            await expect(editor).toBeVisible();
            await editor.fill('Rowing');
            await page.keyboard.press('Enter');
            await expect(editor).toHaveCount(0);

            // valueParser wraps the text as { name: 'Rowing' }; the formatter reads .name back out.
            await expect(sportCell).toContainText('Rowing');
        }
    );
});
