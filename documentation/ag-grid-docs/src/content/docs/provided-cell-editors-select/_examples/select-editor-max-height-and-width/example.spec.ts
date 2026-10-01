import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

const editWrapper = (page: any) => page.locator('.ag-cell-edit-wrapper .ag-picker-field-wrapper').first();
const listItems = (page: any) => page.locator('.ag-select-list .ag-list-item');
const list = (page: any) => page.locator('.ag-select-list').first();

test.agExample(import.meta, () => {
    // Two agSelectCellEditor columns over the same 'color' field. The first uses default list sizing;
    // the second sets valueListMaxHeight: 200 and valueListMaxWidth: 150. Duplicate field ids are
    // de-duplicated, so the second column's id is 'color_1'.
    test.eachFramework('the constrained column applies the configured list size', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        await agIdFor.cell('0', 'color_1').dblclick();
        await expect(editWrapper(page)).toBeVisible();

        await editWrapper(page).click();
        await expect(list(page)).toBeVisible();

        await expect(list(page)).toHaveCSS('max-height', '200px');
        await expect(list(page)).toHaveCSS('width', '150px');
    });

    test.eachFramework('the default column does not constrain the list size', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        await agIdFor.cell('0', 'color').dblclick();
        await expect(editWrapper(page)).toBeVisible();

        await editWrapper(page).click();
        await expect(list(page)).toBeVisible();

        // The unconstrained list does not pick up the 200px/150px sizing of the constrained column.
        await expect(list(page)).not.toHaveCSS('max-height', '200px');
        await expect(list(page)).not.toHaveCSS('width', '150px');
    });

    test.eachFramework('selecting a colour commits it to the cell', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('0', 'color_1');
        await cell.dblclick();
        await expect(editWrapper(page)).toBeVisible();

        await editWrapper(page).click();
        await listItems(page).filter({ hasText: 'AliceBlue' }).click();
        await page.keyboard.press('Enter');

        await expect(cell).toContainText('AliceBlue');
    });

    // Docs: valueListMaxHeight constrains the popup size - with 148 colours the list scrolls
    // rather than being clipped.
    test.eachFramework('the constrained list scrolls through all the values', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        await agIdFor.cell('0', 'color_1').dblclick();
        await expect(editWrapper(page)).toBeVisible();
        await editWrapper(page).click();
        await expect(list(page)).toBeVisible();

        const { scrollHeight, clientHeight } = await list(page).evaluate((el: HTMLElement) => ({
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight,
        }));
        expect(clientHeight).toBeLessThanOrEqual(200);
        expect(scrollHeight).toBeGreaterThan(clientHeight);

        // Scrolling reaches the last colour, so the values are scrollable rather than clipped away.
        await listItems(page).filter({ hasText: 'YellowGreen' }).last().scrollIntoViewIfNeeded();
        await expect(listItems(page).filter({ hasText: 'YellowGreen' }).last()).toBeVisible();
    });

    // Docs: "the editor popups in the right column are displayed with a specified size, whereas the
    // editor popups in the left column are displayed with the default size" - the constrained popup
    // is the shorter of the two.
    test.eachFramework('the constrained popup is shorter than the default popup', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        await agIdFor.cell('0', 'color').dblclick();
        await editWrapper(page).click();
        await expect(list(page)).toBeVisible();
        const defaultBox = await list(page).boundingBox();

        await page.keyboard.press('Escape');
        await expect(page.locator('.ag-select-list')).toHaveCount(0);

        await agIdFor.cell('0', 'color_1').dblclick();
        await editWrapper(page).click();
        await expect(list(page)).toBeVisible();
        const constrainedBox = await list(page).boundingBox();

        expect(constrainedBox!.height).toBeLessThan(defaultBox!.height);
    });

    // Docs refer to the two columns as left and right; only their header names identify them.
    test.eachFramework('the two columns are the default and the constrained editors', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        await expect(agIdFor.headerCell('color')).toContainText('Select Editor Without Max Height and Max Width');
        await expect(agIdFor.headerCell('color_1')).toContainText('Select Editor With Max Height and Max Width');
    });
});
