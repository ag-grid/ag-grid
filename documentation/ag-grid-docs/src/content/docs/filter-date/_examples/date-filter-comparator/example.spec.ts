import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('renders string dates in dd/mm/yyyy form', async ({ agIdFor }) => {
        // dates are stored as dd/mm/yyyy strings; the first row is Michael Phelps 24/08/2008
        await expect(agIdFor.cell('0', 'date')).toContainText('24/08/2008');
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
    });

    test.eachFramework('comparator applies an equals filter on the string dates', async ({ page, agIdFor }) => {
        const dateHeader = agIdFor.headerCell('date');

        await expect(dateHeader).not.toHaveClass(/ag-header-cell-filtered/);

        await agIdFor.headerFilterButton('date').click();

        const filterInput = agIdFor.dateFilterInstanceInput({ source: 'column-filter' });
        await expect(filterInput).toBeVisible();
        await filterInput.fill('2008-08-24');
        await filterInput.dispatchEvent('input');

        // close the popup by clicking a cell
        await agIdFor.cell('0', 'athlete').click();

        await expect(dateHeader).toHaveClass(/ag-header-cell-filtered/);

        // every remaining row matches the filtered date, proving the comparator resolved the equality
        const dateAt = (index: number) => page.locator(`.ag-row[row-index="${index}"] [col-id="date"]`).first();
        await expect(dateAt(0)).toContainText('24/08/2008');
        await expect(dateAt(1)).toContainText('24/08/2008');
        await expect(dateAt(2)).toContainText('24/08/2008');
    });
});
