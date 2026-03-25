import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('startDateTime column filter opens and applies with equals', async ({ page, agIdFor }) => {
        const cell = agIdFor.cell('0', 'startDateTime');
        await expect(cell).toBeVisible();
        const cellText = (await cell.textContent())!.trim();

        const filterBtn = agIdFor.headerFilterButton('startDateTime');
        await filterBtn.click();

        const filterInput = agIdFor.dateFilterInstanceInput({ source: 'column-filter' });
        await expect(filterInput).toBeVisible();

        // Built-in dateTime formatter outputs "YYYY-MM-DDTHH:mm:ss" (local time, T separator already present)
        await filterInput.fill(cellText);
        await filterInput.dispatchEvent('input');

        await cell.click();

        await expect(page.locator('.ag-center-cols-container .ag-row[row-id]')).toHaveCount(1);
    });

    test.eachFramework('startDate column filter opens and applies with equals', async ({ page, agIdFor }) => {
        const cell = agIdFor.cell('0', 'startDate');
        await expect(cell).toBeVisible();
        const cellText = (await cell.textContent())!.trim();

        const filterBtn = agIdFor.headerFilterButton('startDate');
        await filterBtn.click();

        const filterInput = agIdFor.dateFilterInstanceInput({ source: 'column-filter' });
        await expect(filterInput).toBeVisible();

        await filterInput.fill(cellText);
        await filterInput.dispatchEvent('input');

        await cell.click();

        await expect(page.locator('.ag-center-cols-container .ag-row[row-id]')).toHaveCount(1);
    });

    test.eachFramework('endDate column filter opens and applies with equals', async ({ page, agIdFor }) => {
        const cell = agIdFor.cell('0', 'endDate');
        await expect(cell).toBeVisible();
        const cellText = (await cell.textContent())!.trim();

        const filterBtn = agIdFor.headerFilterButton('endDate');
        await filterBtn.click();

        const filterInput = agIdFor.dateFilterInstanceInput({ source: 'column-filter' });
        await expect(filterInput).toBeVisible();

        await filterInput.fill(cellText);
        await filterInput.dispatchEvent('input');

        await cell.click();

        await expect(page.locator('.ag-center-cols-container .ag-row[row-id]')).toHaveCount(1);
    });

    test.eachFramework('endDateTime column filter opens and applies with equals', async ({ page, agIdFor }) => {
        const cell = agIdFor.cell('0', 'endDateTime');
        await expect(cell).toBeVisible();
        const cellText = (await cell.textContent())!.trim();

        const filterBtn = agIdFor.headerFilterButton('endDateTime');
        await filterBtn.click();

        const filterInput = agIdFor.dateFilterInstanceInput({ source: 'column-filter' });
        await expect(filterInput).toBeVisible();

        // valueFormatter outputs "YYYY-MM-DD HH:mm:ss"; convert to datetime-local format "YYYY-MM-DDTHH:mm:ss"
        const datetimeValue = cellText.replace(' ', 'T');
        await filterInput.fill(datetimeValue);
        await filterInput.dispatchEvent('input');

        const otherCell = agIdFor.cell('0', 'startDate');
        await otherCell.click();

        await expect(page.locator('.ag-center-cols-container .ag-row[row-id]')).toHaveCount(1);
    });
});
