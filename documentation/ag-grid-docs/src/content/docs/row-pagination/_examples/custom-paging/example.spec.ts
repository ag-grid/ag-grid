import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Starts on page 5 with custom number formatting', async ({ agIdFor }) => {
        // paginationGoToPage(4) is called on first data rendered, so starts on page 5
        // paginationNumberFormatter wraps numbers in brackets: [x]
        await expect(agIdFor.paginationSummaryPanelCurrentPage('[5]')).toBeVisible();
        await expect(agIdFor.paginationSummaryPanelTotalPage('[18]')).toBeVisible();
    });

    test.eachFramework('Row summary shows bracketed numbers', async ({ agIdFor }) => {
        // Page 5 with page size 500: rows 2,001 to 2,500 of 8,618
        await expect(agIdFor.paginationPanelFirstRowOnPage('[2,001]')).toBeVisible();
        await expect(agIdFor.paginationPanelLastRowOnPage('[2,500]')).toBeVisible();
        await expect(agIdFor.paginationPanelRecordCount('[8,618]')).toBeVisible();
    });

    test.eachFramework('Page size selector shows 500', async ({ agIdFor }) => {
        await expect(agIdFor.paginationPanelSizePickerDisplay('500')).toBeVisible();
    });
});
