import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // groupTotalRow callback: 'bottom' for level-1 (year) groups and for the "United States" country group.
    // Data is the first 50 rows; United States and Russia are expanded on first render.
    const usFooterId = 'rowGroupFooter_row-group-country-United States';
    const usYear2008FooterId = 'rowGroupFooter_row-group-country-United States-year-2008';

    test.eachFramework(
        'United States country group shows a footer, others do not',
        async ({ agIdFor, page, agFramework }) => {
            // React loses the onFirstDataRendered expansion when data loads synchronously — see AG-17785.
            test.fixme(
                agFramework.startsWith('reactFunctionalTs'),
                'AG-17785: React loses onFirstDataRendered expansion'
            );

            // United States (key match) has a country-level footer with its subtotals.
            await expect(agIdFor.autoGroupCell(usFooterId)).toContainText('Total United States', {
                useInnerText: true,
            });
            await expect(agIdFor.cell(usFooterId, 'gold')).toContainText('51');
            await expect(agIdFor.cell(usFooterId, 'silver')).toContainText('21');
            await expect(agIdFor.cell(usFooterId, 'bronze')).toContainText('17');

            // Australia (no key match, level 0) has no country-level footer.
            const australiaFooter = page.locator(
                '[data-testid="ag-row:row-id=rowGroupFooter_row-group-country-Australia"]'
            );
            await expect(australiaFooter).toHaveCount(0);
        }
    );

    test.eachFramework('Year sub-groups get a footer when expanded', async ({ agIdFor, agFramework }) => {
        // React loses the onFirstDataRendered expansion when data loads synchronously — see AG-17785.
        test.fixme(agFramework.startsWith('reactFunctionalTs'), 'AG-17785: React loses onFirstDataRendered expansion');

        // United States is expanded on first render; its year sub-groups start collapsed with no footer.
        await expect(agIdFor.cell(usYear2008FooterId, 'gold')).not.toBeVisible();

        // Expand the 2008 year sub-group (level 1, so the callback returns 'bottom') to reveal its footer.
        await agIdFor.autoGroupContracted('row-group-country-United States-year-2008').click();
        await expect(agIdFor.cell(usYear2008FooterId, 'gold')).toContainText('13');
        await expect(agIdFor.cell(usYear2008FooterId, 'silver')).toContainText('8');
        await expect(agIdFor.cell(usYear2008FooterId, 'bronze')).toContainText('6');
    });
});
