import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        // All expanded (groupDefaultExpanded: -1) with multiRow selection, groupSelects: 'self'
        await expect(agIdFor.autoGroupCell('0')).toContainText('Proposal.docx', { useInnerText: true });

        const findGroupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        const desktopRow = findGroupRow('Desktop');
        const modeSelect = page.locator('#input-group-selection-mode');
        const quickFilter = page.locator('#input-quick-filter');

        // Desktop children: Proposal.docx (0), Timeline.xlsx (1), ToDoList.txt (2), MeetingNotes_August.pdf (3)
        const row0 = agIdFor.rowNode('0');
        const row1 = agIdFor.rowNode('1');
        const row2 = agIdFor.rowNode('2');
        const row3 = agIdFor.rowNode('3');

        // --- self mode (default): clicking group checkbox does NOT select descendants ---
        await desktopRow.locator('.ag-checkbox-input').click();

        await expect(row0).not.toHaveClass(/ag-row-selected/);
        await expect(row1).not.toHaveClass(/ag-row-selected/);
        await expect(row2).not.toHaveClass(/ag-row-selected/);

        // Deselect
        await desktopRow.locator('.ag-checkbox-input').click();

        // --- descendants mode: clicking group checkbox selects ALL descendants ---
        await modeSelect.selectOption('descendants');
        await desktopRow.locator('.ag-checkbox-input').click();

        await expect(row0).toHaveClass(/ag-row-selected/);
        await expect(row1).toHaveClass(/ag-row-selected/);
        await expect(row2).toHaveClass(/ag-row-selected/);
        await expect(row3).toHaveClass(/ag-row-selected/);

        // Deselect
        await desktopRow.locator('.ag-checkbox-input').click();
        await expect(row0).not.toHaveClass(/ag-row-selected/);

        // --- filteredDescendants mode: clicking group checkbox selects only filtered descendants ---
        await modeSelect.selectOption('filteredDescendants');

        // Filter to "Proposal" - only Proposal.docx rows should be visible
        await quickFilter.fill('Proposal');
        await expect(row2).not.toBeVisible(); // ToDoList.txt filtered out
        await expect(agIdFor.autoGroupCell('0')).toContainText('Proposal.docx', { useInnerText: true });

        // Click Desktop group checkbox - should select only filtered descendants
        await desktopRow.locator('.ag-checkbox-input').click();
        await expect(row0).toHaveClass(/ag-row-selected/); // Proposal.docx matches filter

        // Clear filter to verify non-matching descendants were NOT selected
        await quickFilter.fill('');
        await expect(row1).toBeVisible(); // Timeline.xlsx is back
        await expect(row1).not.toHaveClass(/ag-row-selected/); // but was not selected
        await expect(row0).toHaveClass(/ag-row-selected/); // Proposal.docx still selected

        // Desktop checkbox should be indeterminate (1 of 4 children selected)
        const desktopCheckbox = desktopRow.locator('.ag-checkbox-input-wrapper');
        await expect(desktopCheckbox).toHaveClass(/ag-indeterminate/);
    });
});
