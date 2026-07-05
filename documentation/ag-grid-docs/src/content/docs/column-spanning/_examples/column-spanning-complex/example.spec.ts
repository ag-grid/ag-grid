import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Row 0 is the "big-title" section: jan colSpan === 6, spanning the whole row.
    test.eachFramework('Big-title rows span all six columns', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'jan')).toContainText('Warehouse 1');
        // Every other column is covered by the six-column span.
        await expect(agIdFor.cell('0', 'feb')).not.toBeVisible();
        await expect(agIdFor.cell('0', 'mar')).not.toBeVisible();
        await expect(agIdFor.cell('0', 'apr')).not.toBeVisible();
        await expect(agIdFor.cell('0', 'may')).not.toBeVisible();
        await expect(agIdFor.cell('0', 'jun')).not.toBeVisible();
    });

    // Row 1 is the "quarters" section: jan and apr each colSpan === 3.
    test.eachFramework('Quarter rows split into two three-column spans', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('1', 'jan')).toContainText('Q1');
        await expect(agIdFor.cell('1', 'apr')).toContainText('Q2');
        // feb/mar covered by the Q1 span; may/jun covered by the Q2 span.
        await expect(agIdFor.cell('1', 'feb')).not.toBeVisible();
        await expect(agIdFor.cell('1', 'mar')).not.toBeVisible();
        await expect(agIdFor.cell('1', 'may')).not.toBeVisible();
        await expect(agIdFor.cell('1', 'jun')).not.toBeVisible();
    });

    // Row 2 is an ordinary data row: colSpan === 1, so every monthly cell renders.
    test.eachFramework('Data rows render every column', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('2', 'jan')).toContainText('534');
        await expect(agIdFor.cell('2', 'feb')).toContainText('612');
        await expect(agIdFor.cell('2', 'mar')).toContainText('243');
        await expect(agIdFor.cell('2', 'apr')).toContainText('231');
        await expect(agIdFor.cell('2', 'may')).toContainText('428');
        await expect(agIdFor.cell('2', 'jun')).toContainText('231');
    });

    // The spanning pattern repeats for the second warehouse section further down.
    test.eachFramework('Spanning repeats for the second warehouse', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('8', 'jan')).toContainText('Warehouse 2');
        await expect(agIdFor.cell('8', 'jun')).not.toBeVisible();

        await expect(agIdFor.cell('9', 'jan')).toContainText('Q1');
        await expect(agIdFor.cell('9', 'apr')).toContainText('Q2');

        await expect(agIdFor.cell('10', 'jan')).toContainText('21');
        await expect(agIdFor.cell('10', 'jun')).toContainText('31');
    });

    // The big-title cell carries the header-cell class via cellClassRules.
    test.eachFramework('Section styling is applied via cellClassRules', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'jan')).toHaveClass(/header-cell/);
        await expect(agIdFor.cell('1', 'jan')).toHaveClass(/quarters-cell/);
    });
});
