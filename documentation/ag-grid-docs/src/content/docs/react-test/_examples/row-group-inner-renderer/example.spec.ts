import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.reactFunctionalTs('Example loads with row groups and custom inner renderer', async ({ page }) => {
        await expect(page.locator('.ag-row-group').first()).toBeVisible();
        await expect(page.getByRole('button', { name: 'Refresh' }).first()).toBeVisible();
    });

    // test.reactFunctionalTs(
    //     'Sweeping across parent + leaf Refresh buttons while toggling expansion does not throw React maximum update depth',
    //     async ({ page }) => {
    //         test.setTimeout(120_000);

    //         const groupCell = (n: number) =>
    //             page.getByTestId(`ag-cell:row-id=row-group-group-${n};colId=ag-Grid-AutoColumn`);
    //         const leafCell = (id: number) => page.getByTestId(`ag-cell:row-id=${id};colId=ag-Grid-AutoColumn`);
    //         const refreshIn = (cell: ReturnType<typeof groupCell>) =>
    //             cell.getByRole('button', { name: 'Refresh' }).first();

    //         // All groups start collapsed.
    //         await expect(refreshIn(groupCell(0))).toBeVisible();

    //         // While group-0 is collapsed the only visible Refresh buttons are on the
    //         // parent group rows, so sweep over the sibling groups too.
    //         const collapsedTargets = [
    //             refreshIn(groupCell(0)),
    //             refreshIn(groupCell(1)),
    //             refreshIn(groupCell(2)),
    //             refreshIn(groupCell(3)),
    //             refreshIn(groupCell(4)),
    //         ];

    //         // While group-0 is expanded the leaf rows of that group become visible
    //         // (data assigns every 5th id to group-0: 0, 5, 10, 15, …) and we sweep
    //         // across the parent + first few leaves.
    //         const expandedTargets = [
    //             refreshIn(groupCell(0)),
    //             refreshIn(leafCell(0)),
    //             refreshIn(leafCell(5)),
    //             refreshIn(leafCell(10)),
    //             refreshIn(leafCell(15)),
    //         ];

    //         // hover() handles scroll-into-view, visibility waits, and box computation
    //         // for us — more robust than capturing bounding boxes up front, which is
    //         // flaky when virtualised rows have not finished settling.
    //         const sweep = async (targets: typeof collapsedTargets) => {
    //             for (const btn of targets) {
    //                 await btn.hover();
    //             }
    //             for (let i = targets.length - 1; i >= 0; i--) {
    //                 await targets[i].hover();
    //             }
    //         };

    //         // Click whichever chevron is currently displayed on the parent group cell.
    //         // The CssClassManager toggles `ag-hidden` on `.ag-group-expanded` / `.ag-group-contracted`
    //         // so we click the one that does not have it.
    //         const toggleParentExpansion = () =>
    //             groupCell(0)
    //                 .locator('.ag-group-expanded:not(.ag-hidden), .ag-group-contracted:not(.ag-hidden)')
    //                 .first()
    //                 .click();

    //         for (let cycle = 0; cycle < 30; cycle++) {
    //             await sweep(collapsedTargets);
    //             await toggleParentExpansion(); // expand group-0
    //             await sweep(expandedTargets);
    //             await toggleParentExpansion(); // collapse group-0
    //         }
    //     }
    // );
});
