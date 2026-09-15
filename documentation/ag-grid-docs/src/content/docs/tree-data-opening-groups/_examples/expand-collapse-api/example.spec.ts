import { expect, orderedValues, test } from '@utils/grid/test-utils';

const GROUP_COL = 'ag-Grid-AutoColumn';

// Fillers are keyed by path; rows of their own are keyed by getRowId, the last segment of the path.
const DESKTOP = 'row-group-0-Desktop';
const DOCUMENTS = 'row-group-0-Documents';
const WORK = 'row-group-0-Documents-1-Work';
const PROJECT_BETA = 'row-group-0-Documents-1-Work-2-ProjectBeta';
const PROJECT_ALPHA = 'ProjectAlpha';
const PROPOSAL_DOCX = 'Proposal.docx';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor }) => {
        // onGridReady expands the path to 'Proposal.docx' via API, which lives under
        // Documents > Work > ProjectAlpha - so each of those three ancestors is opened.
        await expect(agIdFor.autoGroupExpanded(DOCUMENTS)).toBeVisible();
        await expect(agIdFor.autoGroupExpanded(WORK)).toBeVisible();
        await expect(agIdFor.autoGroupExpanded(PROJECT_ALPHA)).toBeVisible();

        // Proposal.docx should be visible (target of expansion)
        await expect(agIdFor.autoGroupCell(PROPOSAL_DOCX)).toContainText('Proposal.docx', { useInnerText: true });

        // Desktop is on no ancestor path, so it stays shut
        await expect(agIdFor.autoGroupContracted(DESKTOP)).toBeVisible();
    });

    // The date and number filters each need their own module registered; without it the popup throws on
    // open instead of appearing. The columns name their filters, so every framework gets the same one.
    test.eachFramework('date filters open and filter the tree', async ({ agIdFor, page }) => {
        await agIdFor.headerFilterButton('modified').click();
        await expect(agIdFor.dateFilterInstanceInput({ source: 'column-filter' })).toBeVisible();
        await page.keyboard.press('Escape');

        await agIdFor.headerFilterButton('created').click();
        const createdFilter = agIdFor.dateFilterInstanceInput({ source: 'column-filter' });
        await expect(createdFilter).toBeVisible();

        // Report.pdf, under Documents > Work > ProjectBeta, is the only file created on this date.
        await createdFilter.fill('2023-06-22');
        await createdFilter.dispatchEvent('input');
        await page.keyboard.press('Escape');

        // Desktop holds no match, so its disappearance marks the filter as applied.
        await expect(agIdFor.autoGroupCell(DESKTOP)).toHaveCount(0);

        await expect(agIdFor.autoGroupExpanded(WORK)).toBeVisible();
        await agIdFor.autoGroupContracted(PROJECT_BETA).click();

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
        await page.keyboard.press('Escape');

        await expect(agIdFor.autoGroupCell(DOCUMENTS)).toHaveCount(0);
        await agIdFor.autoGroupContracted(DESKTOP).click();

        // Desktop's other children, ToDoList.txt among them, are dropped on size.
        await expect(async () => {
            expect(await orderedValues(page, GROUP_COL)).toEqual(['Desktop', 'MeetingNotes_August.pdf']);
        }).toPass();
    });
});
