/**
 * Issue: when the grid is inside a <form>, the buttons of the new Filters Tool Panel behave as submit buttons of that
 * form. Expanding a filter card submits the host form, and pressing Enter in an app text field activates a grid
 * button instead of submitting the form.
 *
 * Setup: an Enterprise grid with `enableFilterHandlers: true` and the 'filters-new' tool panel open, inside a <form>
 * that also holds an app text field before the grid and the app's own submit button after it. In the first test a
 * filter is set so that a filter card is shown, and the card's expand button is clicked. In the second test no filter
 * is set, so only the Add Filter button is shown; the app text field is focused and Enter is pressed.
 *
 * Expected: interacting with the grid's own controls must not submit the page's form, and Enter in an app text field
 * submits the form through the first submit button, which is the app's own (HTML "implicit submission"). The grid's
 * other buttons set type="button" so that they never act as a host form's submit button.
 *
 * Actual: the card expand and delete buttons and the Add Filter button are created with no `type`, so they default to
 * type="submit". Clicking expand submits the host form with the expand button as the submitter. Because these are the
 * first submit buttons in the form, Enter in the app field "clicks" one of them instead of the app's button: with no
 * filters the Add Filter picker opens (the button removes itself, so the form is not submitted at all).
 *
 * Reported on: not reported; found by area review.
 *
 * Source: found by an area review of "Grid buttons inside a host form" for AG-18665. Related search: "button type
 * attribute inside form default submit".
 */
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

const options = () => ({
    columnDefs: [{ field: 'name', filter: 'agTextColumnFilter' }],
    rowData: [{ name: 'Alice' }],
    enableFilterHandlers: true,
    sideBar: { toolPanels: ['filters-new'], defaultToolPanel: 'filters-new' },
});

async function wrapGridInForm(page: Page) {
    await page.evaluate(() => {
        const gridDiv = document.querySelector('#myGrid')!;
        const form = document.createElement('form');
        form.innerHTML = '<input id="app-field"><div id="grid-slot"></div><button id="app-submit">Save</button>';
        gridDiv.before(form);
        form.querySelector('#grid-slot')!.replaceWith(gridDiv);
        (window as any).submitters = [];
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            (window as any).submitters.push((e.submitter as HTMLElement | null)?.className ?? null);
        });
    });
}

test('expanding a filter card does not submit the host form', async ({ page }) => {
    const { grid, withApi } = await mountGrid(page, { enterprise: true, height: 300, options });
    await wrapGridInForm(page);

    await withApi((api) => api.setFilterModel({ name: { filterType: 'text', type: 'contains', filter: 'A' } }));
    const expand = grid.locator('.ag-filter-card-expand');
    await expect(expand).toBeVisible();
    await expand.click();

    await expect(grid.locator('.ag-filter-card-expand[aria-expanded="true"]')).toHaveCount(1);
    const submitters = await page.evaluate(() => (window as any).submitters);
    expect(submitters).toEqual([]);
});

test('Enter in an app text field submits the host form rather than opening the Add Filter picker', async ({ page }) => {
    const { grid } = await mountGrid(page, { enterprise: true, height: 300, options });
    await wrapGridInForm(page);
    await expect(grid.locator('.ag-filter-add-button')).toBeVisible();

    await page.locator('#app-field').press('Enter');

    await expect.poll(() => page.evaluate(() => (window as any).submitters.length)).toBe(1);
    await expect(grid.locator('.ag-filter-add-select')).toHaveCount(0);
});
