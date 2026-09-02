import { demoContent, demoNames } from '@components/demos/demoContent';
import { expect, test } from '@playwright/test';
import { setupConsoleExpectations } from '@utils/grid/test-utils';

// These could be extended to actually interact with the examples more
// but for now just a basic load test to ensure no errors / warnings in console
// and the grid loads without issues

// The demo pages' title, meta description and H1 come from the frontmatter contract in
// content/demos/demos.json (SE-125). Asserting them here guards the copy against a page that
// stops reading the contract — the failure that left every demo on a "Demo - {name}" title.
test.describe('Demo page SEO copy', () => {
    for (const demo of demoNames) {
        test(`${demo} serves its title, meta description and H1`, async ({ page }) => {
            const content = demoContent(demo);
            await page.goto(content.href.replace(/^\//, ''));

            await expect(page).toHaveTitle(content.seoTitle);
            await expect(page.locator('head meta[name="description"]')).toHaveAttribute(
                'content',
                content.seoDescription
            );
            await expect(page.locator('head meta[property="og:title"]')).toHaveAttribute('content', content.seoTitle);
            await expect(page.getByRole('heading', { level: 1 })).toHaveText(content.seoH1);
            const intro = page.locator('[class*="topHeader"] p');
            await expect(intro).toHaveText(content.intro);

            const renderedLinks = await intro
                .getByRole('link')
                .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
            expect(renderedLinks).toEqual(content.introSegments.filter(({ href }) => href).map(({ href }) => href));
        });
    }
});

// The header reserves a measured height (pages-styles/example.module.scss) so that longer copy on
// one demo cannot shift the page; copy that outgrows the reserve would regress that silently.
test.describe('Demo page header layout', () => {
    const viewports = [
        { width: 1920, height: 1080 },
        { width: 1280, height: 900 },
        { width: 430, height: 900 },
    ];

    for (const viewport of viewports) {
        test(`every demo puts its header and links in the same place at ${viewport.width}x${viewport.height}`, async ({
            page,
        }) => {
            const layouts: Record<string, unknown> = {};

            for (const demo of demoNames) {
                await page.setViewportSize(viewport);
                await page.goto(demoContent(demo).href.replace(/^\//, ''));

                const header = page.locator('[class*="topHeader"]');
                await expect(header.getByRole('heading', { level: 1 })).toBeVisible();

                const headerBox = await header.boundingBox();
                const linksBox = await header.getByRole('link', { name: 'See On GitHub' }).boundingBox();
                layouts[demo] = {
                    headerHeight: headerBox?.height,
                    // Relative to the header, not to the page scroll position.
                    linksX: Math.round((linksBox?.x ?? 0) - (headerBox?.x ?? 0)),
                    linksY: Math.round((linksBox?.y ?? 0) - (headerBox?.y ?? 0)),
                };
            }

            const distinctLayouts = new Set(Object.values(layouts).map((layout) => JSON.stringify(layout)));
            expect(distinctLayouts.size, `demo header layouts: ${JSON.stringify(layouts, null, 2)}`).toBe(1);
        });
    }
});

test.describe(`Demo Examples`, async () => {
    let errors: string[];

    test.beforeEach(async ({ page }) => {
        errors = setupConsoleExpectations(page);
    });

    test.afterEach(async () => {
        expect(errors, 'Example Errors').toEqual([]);
    });

    test('example', async ({ page }) => {
        await page.goto('example');
        await page.waitForSelector('.ag-root-wrapper', { state: 'visible' });
        await page.waitForTimeout(1000);

        await page.locator('button').filter({ hasText: 'Rows, 22 Cols' }).click();
        await page.getByRole('option', { name: '1,000 Rows, 22 Cols' }).click();
        await page.locator('button').filter({ hasText: 'Quartz' }).click();
        await page.getByText('Balham').click();
        await page.getByRole('textbox', { name: 'Filter', exact: true }).click();
        await page.getByRole('textbox', { name: 'Filter', exact: true }).fill('');
        await page.getByText('Drag here to set row groups').first().click();
        await page.getByRole('grid').getByText('Country').click();
        await page.locator('.ag-cell-label-container.ag-header-cell-sorted-asc > .ag-header-icon > .ag-icon').click();
        await page.getByText('Group by Country').click();
        await page.getByRole('tab', { name: 'Columns' }).click();
    });

    test('example-finance', async ({ page }) => {
        await page.goto('example-finance');
        await page.waitForSelector('.ag-root-wrapper', { state: 'visible' });
        await page.waitForTimeout(1000);

        await page
            .locator(
                '.ag-header-cell.ag-header-parent-hidden.ag-header-cell-sortable.ag-right-aligned-header > .ag-header-cell-comp-wrapper > .ag-cell-label-container > .ag-header-icon.ag-header-cell-menu-button > .ag-icon'
            )
            .first()
            .click();
        await page.getByText('Group by Instrument').click();
        await page.locator('.ag-icon.ag-icon-menu-alt').first().click();
        await page.getByText('Collapse All Row Groups').click();
    });

    test('example-hr', async ({ page }) => {
        await page.goto('example-hr');
        await page.waitForSelector('.ag-root-wrapper', { state: 'visible' });
        await page.waitForTimeout(1000);
        await page
            .locator(
                '.ag-cell-wrapper.ag-cell-expandable.ag-row-group.ag-row-group-indent-1 > .ag-group-expanded > .ag-icon'
            )
            .first()
            .click();
        await page.getByRole('columnheader', { name: 'Department' }).locator('div').nth(3).click();
        await page.getByRole('columnheader', { name: 'Department' }).locator('div').nth(3).click();
    });

    test('example-inventory', async ({ page }) => {
        await page.goto('example-inventory');
        await page.waitForSelector('.ag-root-wrapper', { state: 'visible' });
        await page.waitForTimeout(1000);

        // Hold Selling triggers an in-cell row update; afterEach guards that it completes without console errors.
        const firstRow = page.getByRole('row').filter({ hasText: 'Dreams of You' });
        await firstRow.getByRole('button', { name: 'Hold Selling' }).click();
        await expect(firstRow.getByText('On Hold')).toBeVisible();

        await page.getByRole('textbox', { name: 'Search product...' }).fill('Lon');
        await page.getByRole('button', { name: 'Active' }).click();
        await page.getByRole('button', { name: 'On Hold' }).click();
        await page.getByRole('button', { name: 'Out of Stock' }).click();
        await page.getByRole('button', { name: 'All' }).click();
    });
});
