import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

import { GROUP_AUTO_COLUMN_ID } from 'ag-grid-community';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        const select = page.locator('#input-display-type');
        const usRowId = 'row-group-country-United States';
        const countryColId = `${GROUP_AUTO_COLUMN_ID}-country`;
        const yearColId = `${GROUP_AUTO_COLUMN_ID}-year`;

        await waitForGridContent(page);

        // 'singleColumn' (default): one auto group column nests both grouped fields.
        await expect(select).toHaveValue('singleColumn');
        await expect(agIdFor.headerCell(GROUP_AUTO_COLUMN_ID)).toBeVisible();
        await expect(agIdFor.headerCell(countryColId)).not.toBeVisible();
        await expect(agIdFor.autoGroupCell(usRowId)).toContainText('United States', { useInnerText: true });

        // 'multipleColumns': a separate auto group column per grouped field (country, year).
        await select.selectOption('multipleColumns');
        await waitForGridContent(page);
        await expect(agIdFor.headerCell(countryColId)).toBeVisible();
        await expect(agIdFor.headerCell(yearColId)).toBeVisible();
        await expect(agIdFor.headerCell(GROUP_AUTO_COLUMN_ID)).not.toBeVisible();
        await expect(agIdFor.cell(usRowId, countryColId).first()).toContainText('United States', {
            useInnerText: true,
        });

        // 'groupRows': no auto group column; each group renders as a full-width group row.
        await select.selectOption('groupRows');
        await waitForGridContent(page);
        await expect(agIdFor.headerCell(GROUP_AUTO_COLUMN_ID)).not.toBeVisible();
        await expect(agIdFor.headerCell(countryColId)).not.toBeVisible();
        await expect(agIdFor.rowNode(usRowId).first()).toContainText('United States', { useInnerText: true });
    });
});
