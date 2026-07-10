import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('cellRendererSelector picks a renderer per row', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Row 0 is an age row => selector returns undefined => default text renderer shows the raw value
        await expect(agIdFor.cell('0', 'value_1')).toContainText('14');

        // Row 1 is a gender row => GenderRenderer shows the value alongside an icon
        await expect(agIdFor.cell('1', 'value_1')).toContainText('Female');
        await expect(agIdFor.cell('1', 'value_1').locator('i.fa-female')).toBeVisible();

        // Row 2 is a mood row => MoodRenderer shows a smiley image
        await expect(agIdFor.cell('2', 'value_1').locator('img')).toHaveAttribute('src', /smileys\/happy\.png/);
    });

    test.eachFramework('Sorting the type column reorders the rendered rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const happyMood = agIdFor.rowNode('2'); // Happy / mood row

        // Ascending: age < gender < mood, so the mood rows sink to the bottom
        await agIdFor.headerCell('type').click();
        await waitForRowAnimations(page);
        await expect(happyMood).toHaveAttribute('row-index', '4');

        await agIdFor.headerCell('type').click();
        await waitForRowAnimations(page);
        await expect(happyMood).toHaveAttribute('row-index', '0');
    });
});
