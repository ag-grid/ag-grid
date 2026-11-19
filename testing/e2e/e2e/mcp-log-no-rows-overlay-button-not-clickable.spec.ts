/**
 * Issue: a button inside a custom no-rows overlay cannot be clicked. The click passes through the overlay to the grid
 * behind it, so the button's handler never runs. A button in a custom loading overlay works.
 *
 * Setup: empty `rowData`, and a custom no-rows overlay registered as `components: { agNoRowsOverlay: ... }` whose GUI
 * is a button that counts its clicks. The test clicks the middle of the button with the mouse.
 *
 * Expected: the Provided Overlays docs ("Custom Overlay Components") describe replacing the no-rows overlay with a
 * custom component and do not say its content is non-interactive, so a button in it receives the click (or the docs
 * say how to make overlay content interactive).
 *
 * Actual: the button's click handler is not called.
 *
 * Reported on: AG Grid React 36.0.0 and 35.0.0, Angular 33.1.1.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). Coding agents using the React docs (35.0.0, Feb 2026 and
 * 36.0.0, Aug 2026) and the Angular docs (33.1.1, Jan 2026) searched for "no rows overlay pointer events click not
 * working custom overlay component", "no rows overlay interactive clickable buttons" and similar.
 */
import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

// TODO: disabled due to AG-19385 - re-enable once fixed
test.skip('a button in a custom no-rows overlay receives clicks', async ({ page }) => {
    await mountGrid(page, {
        width: 400,
        height: 200,
        options: () => {
            (window as any).overlayClicks = 0;
            class NoRowsOverlay {
                eGui!: HTMLElement;
                init() {
                    this.eGui = document.createElement('button');
                    this.eGui.textContent = 'Add a row';
                    this.eGui.addEventListener('click', () => (window as any).overlayClicks++);
                }
                getGui() {
                    return this.eGui;
                }
            }
            return {
                columnDefs: [{ field: 'name' }],
                rowData: [],
                components: { agNoRowsOverlay: NoRowsOverlay },
            };
        },
    });

    const button = page.getByRole('button', { name: 'Add a row' });
    await expect(button).toBeVisible();
    const box = (await button.boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

    await expect.poll(() => page.evaluate(() => (window as any).overlayClicks), { timeout: 2000 }).toBe(1);
});
