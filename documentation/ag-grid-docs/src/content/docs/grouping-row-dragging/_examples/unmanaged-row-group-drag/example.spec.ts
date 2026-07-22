import { dragOverTo, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        const russiaRowId = 'row-group-country-Russia';
        const australiaRowId = 'row-group-country-Australia';

        await waitForGridContent(page);

        // Grouped by country; groups start expanded so leaf rows are visible.
        // Initial membership counts derived from data.ts.
        await expect(agIdFor.autoGroupCell(russiaRowId)).toContainText('Russia (3)', { useInnerText: true });
        await expect(agIdFor.autoGroupCell(australiaRowId)).toContainText('Australia (8)', { useInnerText: true });

        // Only leaf rows expose a drag handle (rowDrag callback returns !node.group).
        // Row 0 is Aleksey Nemov (Russia). Drag it onto the Australia group row.
        const dragHandle = agIdFor.dragHandle('0', 'athlete');
        await expect(dragHandle).toBeVisible();
        await dragOverTo(dragHandle, agIdFor.autoGroupCell(australiaRowId).first());
        await waitForRowAnimations(page);

        // onRowDragMove rewrote the row's country and applied a transaction, moving it
        // between groups: Russia loses a row, Australia gains one.
        await expect(agIdFor.autoGroupCell(russiaRowId)).toContainText('Russia (2)', { useInnerText: true });
        await expect(agIdFor.autoGroupCell(australiaRowId)).toContainText('Australia (9)', { useInnerText: true });
    });
});
