import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'pivotComparator reverses the default alphabetical order of the pivot groups',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // The sport column supplies pivotComparator (b.localeCompare(a)) => reverse alphabetical order,
            // so `Wrestling` (alphabetically last) becomes the leftmost pivot group.
            const wrestlingGroup = agIdFor.headerGroupCell('pivotGroup_sport_Wrestling_0');
            await expect(wrestlingGroup).toBeVisible();
            await expect(wrestlingGroup).toContainText('Wrestling');
            await expect(agIdFor.headerCell('pivot_sport_Wrestling_gold')).toContainText('Gold');

            // Header group cells are absolutely positioned, so determine visual order from their `left`
            // offset rather than DOM order. The rendered sport groups must appear in descending
            // (reverse-alphabetical) order with Wrestling leftmost, proving the pivotComparator was applied.
            // This is robust to virtualisation: it asserts the ordering of whatever is rendered rather than
            // relying on a specific group being scrolled off-screen.
            const sportOrder = await page
                .locator('.ag-header-group-cell[col-id^="pivotGroup_sport_"]')
                .evaluateAll((els) =>
                    els
                        .map((e) => ({
                            sport: e.getAttribute('col-id')!.replace(/^pivotGroup_sport_(.+)_0$/, '$1'),
                            left: e.getBoundingClientRect().left,
                        }))
                        .sort((a, b) => a.left - b.left)
                        .map((e) => e.sport)
                );
            expect(sportOrder.length).toBeGreaterThan(1);
            expect(sportOrder[0]).toBe('Wrestling');
            // Rendered left-to-right order equals reverse-alphabetical order of those same sports.
            const reverseAlphabetical = [...sportOrder].sort((a, b) => b.localeCompare(a));
            expect(sportOrder).toEqual(reverseAlphabetical);
        }
    );
});
