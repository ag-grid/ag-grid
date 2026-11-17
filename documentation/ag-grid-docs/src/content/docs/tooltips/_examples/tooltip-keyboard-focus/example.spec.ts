import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Pointer hover shows cell and header tooltips without focus', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const tooltip = page.locator('.ag-tooltip:not(.ag-tooltip-hiding)');
        const cell = agIdFor.cell('0', 'athlete');
        await cell.hover();
        await expect(cell).not.toBeFocused();
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('Michael Phelps');

        const header = agIdFor.headerCell('country');
        await header.hover();
        await expect(header).not.toBeFocused();
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('Country');
    });

    for (const target of ['cell', 'header'] as const) {
        test.eachFramework(
            `${target} focus describes the tooltip before its visual delay`,
            async ({ agIdFor, page }) => {
                await ensureGridReady(page);
                await waitForGridContent(page);

                // Freeze the visual timer so the immediate description cannot pass after the tooltip opens.
                await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
                await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));

                const source = target === 'cell' ? agIdFor.cell('0', 'athlete') : agIdFor.headerCell('athlete');
                const description = target === 'cell' ? 'Michael Phelps' : 'Athlete';
                const tooltip = page.getByRole('tooltip');

                await source.focus();
                await expect(source).toBeFocused();
                await expect(source).toHaveAccessibleDescription(description);
                await expect(tooltip).toHaveCount(0);

                await page.clock.runFor(499);
                await expect(tooltip).toHaveCount(0);
                await page.clock.runFor(1);
                await page.clock.resume();
                await expect(tooltip).toBeVisible();
                await expect(tooltip).toContainText(description);
            }
        );
    }

    test.eachFramework('Keyboard navigation moves the tooltip between headers and cells', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const tooltip = page.locator('.ag-tooltip:not(.ag-tooltip-hiding)');
        await agIdFor.headerCell('athlete').focus();
        await expect(tooltip).toContainText('Athlete');

        await page.keyboard.press('ArrowRight');
        await expect(agIdFor.headerCell('country')).toBeFocused();
        await expect(tooltip).toContainText('Country');

        await page.keyboard.press('ArrowDown');
        await expect(agIdFor.cell('0', 'country')).toBeFocused();
        await expect(agIdFor.cell('0', 'country')).toHaveAccessibleDescription('United States');
        await expect(tooltip).toContainText('United States');

        await page.keyboard.press('Tab');
        await expect(agIdFor.cell('0', 'sport')).toBeFocused();
        await expect(tooltip).toContainText('Swimming');

        await page.keyboard.press('ArrowDown');
        await expect(agIdFor.cell('1', 'sport')).toBeFocused();
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('Athletics');
        await expect(tooltip).toHaveCount(1);
    });

    test.eachFramework(
        'Escape dismisses the tooltip without moving focus or reopening it',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            const cell = agIdFor.cell('0', 'athlete');
            const tooltip = page.getByRole('tooltip');
            await cell.focus();
            await expect(tooltip).toBeVisible();
            await expect(tooltip).toContainText('Michael Phelps');

            await page.keyboard.press('Escape');
            await expect(tooltip).toHaveCount(0);
            await expect(cell).toBeFocused();

            // Observe beyond the 500 ms show delay to catch a timer reopening the dismissed tooltip.
            await page.waitForTimeout(600);
            await expect(tooltip).toHaveCount(0);
            await expect(cell).toBeFocused();

            await page.keyboard.press('ArrowDown');
            await expect(agIdFor.cell('1', 'athlete')).toBeFocused();
            await expect(tooltip).toBeVisible();
            await expect(tooltip).toContainText('Usain Bolt');
        }
    );
});
