import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // All three columns bind field 'a'; duplicate fields are suffixed, so colIds are
    // 'a' (Raw Value), 'a_1' (Currency), 'a_2' (Bracketed).
    // a = Math.floor(((i + 2) * 173456) % 10000): row 0 -> 6912, row 1 -> 368, row 2 -> 3824.

    test.eachFramework('raw column shows the unformatted value', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'a')).toContainText('6912');
        await expect(agIdFor.cell('1', 'a')).toContainText('368');
    });

    test.eachFramework('currency valueFormatter prefixes with a pound sign and groups digits', async ({
        agIdFor,
        page,
    }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'a_1')).toContainText('£6,912');
        await expect(agIdFor.cell('1', 'a_1')).toContainText('£368');
        await expect(agIdFor.cell('2', 'a_1')).toContainText('£3,824');
    });

    test.eachFramework('brackets valueFormatter wraps the value in parentheses', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'a_2')).toContainText('(6912)');
        await expect(agIdFor.cell('1', 'a_2')).toContainText('(368)');
    });
});
