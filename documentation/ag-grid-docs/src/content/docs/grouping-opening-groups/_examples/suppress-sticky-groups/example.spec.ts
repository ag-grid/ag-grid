import { expect, scrollGridRelative, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        // groupDefaultExpanded: 1 opens the first-level country groups.
        await expect(agIdFor.autoGroupExpanded('row-group-country-Australia')).toBeVisible();

        // suppressGroupRowsSticky: true prevents the group row from sticking to the top
        // while scrolling through its children — so the sticky-top container stays empty.
        await scrollGridRelative('element', page, { y: 400 });

        const stickyRows = page.locator('.ag-sticky-top .ag-row');
        await expect(stickyRows).toHaveCount(0);
    });
});
