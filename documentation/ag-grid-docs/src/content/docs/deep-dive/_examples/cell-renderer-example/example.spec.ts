import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('renders the company logo alongside the name', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const companyCell = agIdFor.cell('0', 'company');
        // The custom cell renderer adds an <img> logo next to the company name.
        await expect(companyCell).toContainText('SpaceX');
        await expect(companyCell.locator('img')).toHaveAttribute('src', /spacex\.png$/);
    });

    test.eachFramework('the logo renderer runs for rows on later pages', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.paginationSummaryPanelButton('next page').click();
        await expect(agIdFor.paginationPanelFirstRowOnPage('101')).toBeVisible();

        // Row 100 (first record on page 2) also renders a company logo image.
        await expect(agIdFor.cell('100', 'company').locator('img')).toBeVisible();
    });
});
