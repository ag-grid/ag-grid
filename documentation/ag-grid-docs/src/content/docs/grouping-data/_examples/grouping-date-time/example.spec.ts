import { expect, test } from '@utils/grid/test-utils';

import { GROUP_AUTO_COLUMN_ID, GROUP_HIERARCHY_COLUMN_ID_PREFIX as vcolPrefix } from 'ag-grid-community';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor }) => {
        const level0GroupRowId = `row-group-${vcolPrefix}-date-year-2008`;
        const level1GroupRowId = `${level0GroupRowId}-${vcolPrefix}-date-month-8`;
        const level2GroupRowId = `${level1GroupRowId}-date-2008-08-24`;

        // Assert has grouped by date parts
        await expect(agIdFor.autoGroupCell(level0GroupRowId)).toContainText('2008 (5)', { useInnerText: true });

        // Expanding year group shows month group
        await agIdFor.groupContracted(level0GroupRowId, GROUP_AUTO_COLUMN_ID).click();
        await expect(agIdFor.autoGroupCell(level1GroupRowId)).toHaveText('8 (5)', {
            useInnerText: true,
        });

        // Expanding month group shows original group
        await agIdFor.groupContracted(level1GroupRowId, GROUP_AUTO_COLUMN_ID).click();
        await expect(agIdFor.autoGroupCell(level2GroupRowId)).toHaveText('2008-08-24 (5)', { useInnerText: true });

        // Enable pivot mode and pivot by Year
        await agIdFor.pivotModeSelect().click();
        agIdFor
            .columnSelectListItemDragHandle('Date (Year) Column')
            .dragTo(agIdFor.columnDropArea('toolbar', 'Column Labels'));

        await expect(agIdFor.headerGroupCell(`pivotGroup_${vcolPrefix}-date-year_2000_0`)).toBeVisible();

        // Then pivot by Year / Month
        agIdFor
            .columnSelectListItemDragHandle('Date (Month) Column')
            .dragTo(agIdFor.columnDropArea('toolbar', 'Column Labels'));
        const headerGroupCell = agIdFor.headerGroupCell(
            `pivotGroup_${vcolPrefix}-date-year-${vcolPrefix}-date-month_2000_0`
        );
        await expect(headerGroupCell).toBeVisible();

        // Expand column group to verify
        await headerGroupCell.locator('.ag-header-expand-icon-collapsed').click();
        expect(
            agIdFor.headerGroupCell(`pivotGroup_${vcolPrefix}-date-year-${vcolPrefix}-date-month_2000-10_0`)
        ).toBeVisible();

        // Uncheck all columns
        await agIdFor.columnSelectListItemCheckbox('Date (Year) Column').click();
        await agIdFor.columnSelectListItemCheckbox('Date (Month) Column').click();
        await agIdFor.columnSelectListItemCheckbox('Date Column').click();

        await expect(agIdFor.columnDropArea('toolbar', 'Row Groups').locator('.ag-column-drop-cell')).toHaveCount(0);

        // Recheck all columns
        // ...in reverse order this time, checking Date should make Month/Year appear immediately, and the other checks are idempotent
        await agIdFor.columnSelectListItemCheckbox('Date Column').click();
        await expect(agIdFor.columnDropArea('toolbar', 'Row Groups').locator('.ag-column-drop-cell')).toHaveCount(3);

        await agIdFor.columnSelectListItemCheckbox('Date (Month) Column').click();
        await expect(agIdFor.columnDropArea('toolbar', 'Row Groups').locator('.ag-column-drop-cell')).toHaveCount(3);

        await agIdFor.columnSelectListItemCheckbox('Date (Year) Column').click();
        await expect(agIdFor.columnDropArea('toolbar', 'Row Groups').locator('.ag-column-drop-cell')).toHaveCount(3);
    });
});
