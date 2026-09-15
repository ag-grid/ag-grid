import { expandGroupRows, expect, orderedValues, test, treeFillerId } from '@utils/grid/test-utils';

const GROUP_COL = 'ag-Grid-AutoColumn';

// Groups here are fillers keyed by path, bar Documents > Work > ProjectAlpha; leaves have no
// getRowId, so they fall back to their `rowData` index.
const DESKTOP = treeFillerId(['Desktop']);
const DOCUMENTS = treeFillerId(['Documents']);
const WORK = treeFillerId(['Documents', 'Work']);
const PERSONAL = treeFillerId(['Documents', 'Personal']);
const PROJECT_BETA = treeFillerId(['Documents', 'Work', 'ProjectBeta']);
const DOWNLOADS = treeFillerId(['Downloads']);
const DESKTOP_PROJECT_ALPHA = treeFillerId(['Desktop', 'ProjectAlpha']);
const WORK_PROJECT_ALPHA = '4';
const SOFTWARE_INSTALLER_EXE = '22';
const RECEIPT_ONLINE_STORE_PDF = '23';
const EBOOK_PDF = '24';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        const viewport = page.locator('.ag-grid-viewport');

        // Shrink the viewport so that not all rows fit after expanding groups
        await page.setViewportSize({ width: 1280, height: 300 });

        // No groupDefaultExpanded, all groups collapsed initially
        await expect(agIdFor.autoGroupContracted(DESKTOP)).toBeVisible();
        await expect(agIdFor.autoGroupContracted(DOCUMENTS)).toBeVisible();
        await expect(agIdFor.autoGroupContracted(DOWNLOADS)).toBeVisible();

        // ProjectAlpha sits under both Desktop and Documents > Work, neither of them open yet
        await expect(agIdFor.autoGroupCell(DESKTOP_PROJECT_ALPHA)).toHaveCount(0);
        await expect(agIdFor.autoGroupCell(WORK_PROJECT_ALPHA)).toHaveCount(0);

        // Expand Documents to create more rows, pushing Downloads further down
        await expandGroupRows(agIdFor, [DOCUMENTS, WORK, PERSONAL]);

        // Record scroll position before expanding Downloads
        const scrollBefore = await viewport.evaluate((el) => el.scrollTop);

        // Expand Downloads (near the bottom) - the onRowGroupOpened handler
        // calls ensureIndexVisible to scroll so all children are visible
        await agIdFor.autoGroupContracted(DOWNLOADS).click();

        // Verify Downloads' children are visible (scroll-to-children behaviour)
        await expect(agIdFor.autoGroupCell(SOFTWARE_INSTALLER_EXE)).toContainText('SoftwareInstaller.exe', {
            useInnerText: true,
        });
        await expect(agIdFor.autoGroupCell(RECEIPT_ONLINE_STORE_PDF)).toContainText('Receipt_OnlineStore.pdf', {
            useInnerText: true,
        });
        await expect(agIdFor.autoGroupCell(EBOOK_PDF)).toContainText('Ebook.pdf', { useInnerText: true });

        // Verify the grid actually scrolled to reveal the children
        const scrollAfter = await viewport.evaluate((el) => el.scrollTop);
        expect(scrollAfter).toBeGreaterThan(scrollBefore);
    });

    // The date and number filters each need their own module registered; without it the popup throws on
    // open instead of appearing. The columns name their filters, so every framework gets the same one.
    test.eachFramework('date filters open and filter the tree', async ({ agIdFor, page }) => {
        await agIdFor.headerFilterButton('modified').click();
        await expect(agIdFor.dateFilterInstanceInput({ source: 'column-filter' })).toBeVisible();
        // Closes the popup - a plain cell carries no expand chevron for the click to land on.
        await agIdFor.cell(DOCUMENTS, 'size').click();

        await agIdFor.headerFilterButton('created').click();
        const createdFilter = agIdFor.dateFilterInstanceInput({ source: 'column-filter' });
        await expect(createdFilter).toBeVisible();

        // Report.pdf, under Documents > Work > ProjectBeta, is the only file created on this date.
        await createdFilter.fill('2023-06-22');
        await createdFilter.dispatchEvent('input');
        await agIdFor.cell(DOCUMENTS, 'size').click();

        // Desktop holds no match, so its disappearance marks the filter as applied.
        await expect(agIdFor.autoGroupCell(DESKTOP)).toHaveCount(0);
        await expandGroupRows(agIdFor, [DOCUMENTS, WORK, PROJECT_BETA]);

        // Tree data keeps a matching leaf's whole ancestor path, though no group has a `created` of its own.
        // ProjectBeta's other child, Budget.xlsx, is a sibling of the match and so is dropped.
        await expect(async () => {
            expect(await orderedValues(page, GROUP_COL)).toEqual(['Documents', 'Work', 'ProjectBeta', 'Report.pdf']);
        }).toPass();
    });

    test.eachFramework('the number filter on size filters the tree', async ({ agIdFor, page }) => {
        await agIdFor.headerFilterButton('size').click();
        const sizeFilter = agIdFor.numberFilterInstanceInput({ source: 'column-filter' });
        await expect(sizeFilter).toBeVisible();

        // MeetingNotes_August.pdf is the only row this size, and no group's `sum` aggregation matches it.
        await sizeFilter.fill('460800');
        await sizeFilter.dispatchEvent('input');
        await agIdFor.cell(DESKTOP, 'size').click();

        await expect(agIdFor.autoGroupCell(DOCUMENTS)).toHaveCount(0);
        await expandGroupRows(agIdFor, [DESKTOP]);

        // Desktop's other children, ToDoList.txt among them, are dropped on size.
        await expect(async () => {
            expect(await orderedValues(page, GROUP_COL)).toEqual(['Desktop', 'MeetingNotes_August.pdf']);
        }).toPass();
    });
});
