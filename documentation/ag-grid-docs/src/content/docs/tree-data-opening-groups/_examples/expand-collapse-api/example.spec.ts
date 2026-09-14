import { expect, test } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

const groupRow = (page: Page, name: string) =>
    page
        .locator('.ag-row')
        .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
        .first();

/**
 * Closes an open filter popup by clicking a group row's text. `name` must be a group that survives the
 * filter being applied, so the click target does not depend on whether the debounce has fired yet, and
 * the text span is used rather than the row so the click cannot land on the expand/collapse chevron.
 */
const closeFilterPopup = (page: Page, name: string) =>
    page.locator('.ag-group-value').filter({ hasText: name }).first().click();

/**
 * Expands each named group that is still collapsed. Every example on this page opens a different set of
 * groups by default, so a filtered path has to be opened up before the surviving rows can be counted.
 */
async function expandGroups(page: Page, names: string[]) {
    for (const name of names) {
        const row = groupRow(page, name);
        await expect(row).toBeVisible();
        const contracted = row.locator('.ag-group-contracted');
        if (await contracted.isVisible()) {
            await contracted.click();
        }
    }
}

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page }) => {
        // onGridReady expands the path to 'Proposal.docx' via API
        const groupValues = page.locator('.ag-group-value');

        // Desktop should be expanded (ancestor of Proposal.docx)
        await expect(groupValues.filter({ hasText: 'Desktop' }).first()).toBeVisible();

        // ProjectAlpha should be expanded (parent of Proposal.docx)
        await expect(groupValues.filter({ hasText: 'ProjectAlpha' }).first()).toBeVisible();

        // Proposal.docx should be visible (target of expansion)
        await expect(groupValues.filter({ hasText: 'Proposal.docx' }).first()).toBeVisible();
    });

    // `created`/`modified` hold ISO date strings and `size` is a number, so `defaultColDef.filter: true`
    // infers a date filter for the first two and a number filter for the third rather than the text filter
    // the column defs might suggest. Each needs its own module registered, and without it the popup throws
    // on open instead of appearing - which is what these two tests guard.
    test.eachFramework(
        'date filters open on created and modified and filter the tree',
        async ({ agFramework, agIdFor, page }) => {
            // The vanilla variant loads the whole enterprise UMD bundle, which registers SetFilter - and that
            // makes `filter: true` resolve to the Set Filter instead of the filter inferred from the cell data
            // type. So these columns cannot show a date/number filter there, and the missing-module bug these
            // tests guard cannot occur on a build that already has every module.
            test.skip(agFramework === 'vanilla', 'Vanilla uses the UMD bundle, so `filter: true` is a Set Filter.');

            const groupValues = page.locator('.ag-group-value');

            await agIdFor.headerFilterButton('modified').click();
            await expect(agIdFor.dateFilterInstanceInput({ source: 'column-filter' })).toBeVisible();
            await closeFilterPopup(page, 'Documents');

            await agIdFor.headerFilterButton('created').click();
            const createdFilter = agIdFor.dateFilterInstanceInput({ source: 'column-filter' });
            await expect(createdFilter).toBeVisible();

            // Report.pdf, under Documents > Work > ProjectBeta, is the only file created on this date.
            await createdFilter.fill('2023-06-22');
            await createdFilter.dispatchEvent('input');
            await closeFilterPopup(page, 'Documents');

            // Desktop holds no match, so its disappearance marks the filter as applied.
            await expect(groupValues.filter({ hasText: 'Desktop' })).toHaveCount(0);
            await expandGroups(page, ['Documents', 'Work', 'ProjectBeta']);

            // Tree data keeps the whole ancestor path of a matching leaf and drops every other branch, so the
            // three groups above Report.pdf survive even though none of them has a `created` value of its own.
            await expect(page.locator('.ag-row')).toHaveCount(4);
            await expect(groupValues.filter({ hasText: 'Report.pdf' }).first()).toBeVisible();
            // Budget.xlsx is ProjectBeta's other child - a sibling of the match, so it is filtered out.
            await expect(groupValues.filter({ hasText: 'Budget.xlsx' })).toHaveCount(0);
        }
    );

    test.eachFramework('the number filter on size filters the tree', async ({ agFramework, agIdFor, page }) => {
        // The vanilla variant loads the whole enterprise UMD bundle, which registers SetFilter - and that
        // makes `filter: true` resolve to the Set Filter instead of the filter inferred from the cell data
        // type. So these columns cannot show a date/number filter there, and the missing-module bug these
        // tests guard cannot occur on a build that already has every module.
        test.skip(agFramework === 'vanilla', 'Vanilla uses the UMD bundle, so `filter: true` is a Set Filter.');

        const groupValues = page.locator('.ag-group-value');

        await agIdFor.headerFilterButton('size').click();
        const sizeFilter = agIdFor.numberFilterInstanceInput({ source: 'column-filter' });
        await expect(sizeFilter).toBeVisible();

        // MeetingNotes_August.pdf, under Desktop, is the only row of this size - and no group's `sum`
        // aggregation lands on it either, so no group matches in its own right.
        await sizeFilter.fill('460800');
        await sizeFilter.dispatchEvent('input');
        await closeFilterPopup(page, 'Desktop');

        await expect(groupValues.filter({ hasText: 'Documents' })).toHaveCount(0);
        await expandGroups(page, ['Desktop']);

        await expect(page.locator('.ag-row')).toHaveCount(2);
        await expect(groupValues.filter({ hasText: 'MeetingNotes_August.pdf' }).first()).toBeVisible();
        // ToDoList.txt is Desktop's other surviving-branch sibling, filtered out on size.
        await expect(groupValues.filter({ hasText: 'ToDoList.txt' })).toHaveCount(0);
    });

    // The counterpart to the vanilla skip above: the UMD bundle's Set Filter is what a reader actually sees
    // on that tab, so it still has to open. The tree-filtering assertions stay on the frameworks above,
    // where the inferred date/number filters - the ones this fix is about - are the filters in play.
    test.vanilla('the column filters open as set filters', async ({ agIdFor, page }) => {
        for (const colId of ['created', 'modified', 'size']) {
            await agIdFor.headerFilterButton(colId).click();
            await expect(agIdFor.setFilterInstanceMiniFilterInput({ source: 'column-filter' })).toBeVisible();
            await closeFilterPopup(page, 'Documents');
        }
    });
});
