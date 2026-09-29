import { expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Deferred updates stage until Apply, and Cancel discards them', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        const toolPanel = page.locator('.ag-column-select');
        await expect(toolPanel).toBeVisible();

        // 'Age' starts visible in the grid.
        const ageHeader = agIdFor.headerCell('age');
        await expect(ageHeader).toBeVisible();

        const ageCheckbox = toolPanel
            .locator('.ag-column-select-column')
            .filter({ hasText: 'Age' })
            .locator('.ag-checkbox-input');
        await expect(ageCheckbox).toBeChecked();

        // Unchecking 'Age' stages the change but does NOT commit it: the grid column stays visible.
        await ageCheckbox.click();
        await expect(ageCheckbox).not.toBeChecked();
        await expect(ageHeader).toBeVisible();

        // Cancel discards the pending change and restores the last applied state.
        await page.getByRole('button', { name: 'Cancel' }).click();
        await expect(ageCheckbox).toBeChecked();
        await expect(ageHeader).toBeVisible();

        // Staging the change again and clicking Apply commits it, hiding the column.
        await ageCheckbox.click();
        await expect(ageCheckbox).not.toBeChecked();
        await expect(ageHeader).toBeVisible();

        await page.getByRole('button', { name: 'Apply' }).click();
        await expect(ageHeader).toBeHidden();
    });

    test.eachFramework(
        'Reset discards pending changes and immediately restores the column definitions',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);

            const toolPanel = page.locator('.ag-column-select');
            const ageHeader = agIdFor.headerCell('age');
            const athleteHeader = agIdFor.headerCell('athlete');
            const columnCheckbox = (label: string) =>
                toolPanel.locator('.ag-column-select-column').filter({ hasText: label }).locator('.ag-checkbox-input');

            // Hide 'Age' and apply it, so the grid now differs from the column definitions.
            await columnCheckbox('Age').click();
            await page.getByRole('button', { name: 'Apply' }).click();
            await expect(ageHeader).toBeHidden();

            // Stage a further change without applying it.
            await columnCheckbox('Athlete').click();
            await expect(columnCheckbox('Athlete')).not.toBeChecked();
            await expect(athleteHeader).toBeVisible();

            // Reset takes effect without Apply: 'Age' is shown again and the staged 'Athlete' change is discarded.
            await page.getByRole('button', { name: 'Reset' }).click();
            await expect(ageHeader).toBeVisible();
            await expect(columnCheckbox('Age')).toBeChecked();
            await expect(athleteHeader).toBeVisible();
            await expect(columnCheckbox('Athlete')).toBeChecked();
        }
    );

    test.eachFramework(
        'a change made outside the tool panel applies immediately and clears pending changes',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);

            const toolPanel = page.locator('.ag-column-select');
            const ageHeader = agIdFor.headerCell('age');
            const ageCheckbox = toolPanel
                .locator('.ag-column-select-column')
                .filter({ hasText: 'Age' })
                .locator('.ag-checkbox-input');

            // Stage a visibility change in the tool panel - the grid is unaffected so far.
            await ageCheckbox.click();
            await expect(ageCheckbox).not.toBeChecked();
            await expect(ageHeader).toBeVisible();

            // 'Athlete' is not grouped yet; the Row Groups panel only holds 'Country'.
            const rowGroupPanel = agIdFor.columnDropArea('panel', 'Row Groups');
            await expect(rowGroupPanel.locator('.ag-column-drop-cell')).toHaveCount(1);

            // Group by Athlete from the grid's column menu - i.e. outside the Columns Tool Panel.
            await agIdFor.headerCell('athlete').hover();
            await agIdFor.headerCellMenuButton('athlete').click();
            await expect(agIdFor.menu()).toBeVisible();
            await agIdFor.menuOption('Group by Athlete').click();
            await waitForRowAnimations(page);

            // (a) It took effect immediately, with no Apply.
            await expect(rowGroupPanel.locator('.ag-column-drop-cell')).toHaveCount(2);
            await expect(rowGroupPanel).toContainText('Athlete');

            // (b) The pending visibility change was discarded: the tick is restored and 'Age' is still shown.
            await expect(ageCheckbox).toBeChecked();
            await expect(ageHeader).toBeVisible();
        }
    );
});
