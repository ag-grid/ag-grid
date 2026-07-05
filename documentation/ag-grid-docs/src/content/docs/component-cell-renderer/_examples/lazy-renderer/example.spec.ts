import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.reactFunctionalTs('Lazy loaded renderer resolves after its delay', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Row 0 = Michael Phelps, country United States (olympic-winners.json)
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // The lazy component resolves after ~3s and renders "Lazy Cell: {value}"
        await expect(agIdFor.cell('0', 'country')).toContainText('Lazy Cell: United States', { timeout: 10000 });
    });
});
