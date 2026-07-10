import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom header renders the display name and data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The custom header renders the display name; default names are the capitalised field.
        await expect(agIdFor.headerCell('athlete')).toContainText('Athlete', { useInnerText: true });

        // First data row is Michael Phelps (United States, age 23).
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'age')).toContainText('23');
    });

    test.eachFramework('Toggling header names refreshes the custom header', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const athleteHeader = agIdFor.headerCell('athlete');

        // Toggling to upper names updates the header text through the component's refresh.
        await page.getByRole('button', { name: 'Upper Header Names' }).click();
        await expect(athleteHeader).toContainText('ATHLETE', { useInnerText: true });

        // Toggling back to lower names updates the text again.
        await page.getByRole('button', { name: 'Lower Header Names' }).click();
        await expect(athleteHeader).toContainText('athlete', { useInnerText: true });
    });
});
