import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Country filter shows the custom accordion title', async ({ page, agIdFor }) => {
        const filterButton = agIdFor.headerFilterButton('country');
        await expect(filterButton).toBeVisible();
        await filterButton.click();

        // The first child Text Filter is wrapped in an accordion with a custom title.
        await expect(page.getByText('Expand Me for Text Filters', { exact: false })).toBeVisible();
    });

    test.eachFramework('Inline Sport filter filters the rows', async ({ page, agIdFor }) => {
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');

        const filterButton = agIdFor.headerFilterButton('sport');
        await expect(filterButton).toBeVisible();
        await filterButton.click();

        const textInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' });
        await expect(textInput).toBeVisible();
        await textInput.fill('Swimming');

        // Row 0 is Swimming and stays; row 4 (Aleksey Nemov, Gymnastics) is filtered out.
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');
        await expect(agIdFor.cell('4', 'sport')).not.toBeVisible();
    });
});
