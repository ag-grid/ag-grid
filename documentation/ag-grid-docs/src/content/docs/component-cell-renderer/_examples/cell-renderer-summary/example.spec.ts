import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom cell components render company data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Row 0 = Microsoft (small-company-data.json)
        await expect(agIdFor.cell('0', 'company')).toContainText('Microsoft');

        // CompanyRenderer renders the website as a link showing the hostname
        await expect(agIdFor.cell('0', 'website')).toContainText('www.microsoft.com');

        // CustomButtonComponent renders "Launch {company}!"
        await expect(agIdFor.cell('0', 'actions')).toContainText('Launch Microsoft!');

        // PriceRenderer draws one pound icon per multiplier. Microsoft revenue 198.3B => >20B => 4 icons
        await expect(agIdFor.cell('0', 'revenue').locator('img.priceIcon')).toHaveCount(4);

        // MissionResultRenderer shows a tick for hardware === true
        await expect(agIdFor.cell('0', 'hardware').locator('img.missionIcon')).toHaveAttribute('src', /tick-in-circle/);
    });

    test.eachFramework('Sorting the company column reorders rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Node '4' = Accenture, which is first alphabetically by company.
        const accenture = agIdFor.rowNode('4');
        await expect(accenture).not.toHaveAttribute('row-index', '0');

        await agIdFor.headerCell('company').click();
        await expect(accenture).toHaveAttribute('row-index', '0');
    });
});
