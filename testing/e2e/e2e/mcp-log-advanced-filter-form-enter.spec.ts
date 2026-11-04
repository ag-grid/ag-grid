/**
 * Issue: when the grid is inside a <form>, pressing Enter in one of the app's own text fields opens the Advanced
 * Filter builder instead of submitting the form.
 *
 * Setup: an Enterprise grid with `enableAdvancedFilter: true` inside a <form> that also holds an app text field
 * before the grid and the app's own submit button after it. The text field is focused and Enter is pressed.
 *
 * Expected: browsers submit a form when Enter is pressed in a text field, using the form's first submit button
 * (HTML "implicit submission"), so the form should be submitted through the app's button. The grid's other buttons
 * set type="button" so that they never act as a host form's submit button.
 *
 * Actual: the Advanced Filter builder button is created with no `type`, so it defaults to type="submit". As the
 * first submit button in the form it becomes the default button: Enter "clicks" it, the builder opens, and the
 * button disables itself while the builder is open, so the form is never submitted. (Clicking the builder button
 * directly does not submit the form for the same reason.)
 *
 * Reported on: AG Grid vanilla 34.1.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). A coding agent on vanilla 34.1.0 searched, in July 2026:
 * "button type attribute inside form default submit".
 */
import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

// TODO: disabled due to AG-XXXXX - placeholder, replace with this bug's JIRA key before merging; re-enable once fixed
test.skip('Enter in an app text field submits the host form rather than opening the Advanced Filter builder', async ({
    page,
}) => {
    await mountGrid(page, {
        enterprise: true,
        height: 300,
        options: () => ({
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            enableAdvancedFilter: true,
        }),
    });

    await page.evaluate(() => {
        const gridDiv = document.querySelector('#myGrid')!;
        const form = document.createElement('form');
        form.innerHTML = '<input id="app-field"><button id="app-submit">Save</button>';
        gridDiv.before(form);
        form.querySelector('#app-field')!.after(gridDiv);
        (window as any).submitters = [];
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            (window as any).submitters.push((e.submitter as HTMLElement | null)?.id ?? null);
        });
    });

    await page.locator('#app-field').press('Enter');

    await expect.poll(() => page.evaluate(() => (window as any).submitters)).toEqual(['app-submit']);
});
