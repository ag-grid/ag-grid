import type { Locator, Page } from '@playwright/test';
import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

const ACTIVE_BACKGROUND = 'rgb(234, 236, 240)';
const INACTIVE_BACKGROUND = 'rgba(0, 0, 0, 0)';

// Button-group labels animate their background, and a hovered segment tints, so park the cursor
// off the controls before reading colours.
async function parkCursor(page: Page) {
    await page.mouse.move(0, 0);
}

async function expectChecked(page: Page, input: Locator, label: Locator) {
    await parkCursor(page);
    await expect(input).toBeChecked();
    await expect(label).toHaveCSS('background-color', ACTIVE_BACKGROUND);
}

test.agExample(import.meta, () => {
    test.eachFramework('Renders the grid and applies the shared control styling', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await expect(agIdFor.cell('0', 'quarter')).toContainText("Q1'18");
        await expect(agIdFor.cell('3', 'services')).toContainText('36');

        const button = page.locator('.example-controls button', { hasText: "I'm a button" }).first();
        await expect(button).toHaveCSS('border-radius', '6px');
        await expect(button).not.toHaveCSS('border-style', 'outset');
    });

    test.eachFramework('Button group highlights the checked segment and moves with arrow keys', async ({ page }) => {
        await ensureGridReady(page);
        const alpha = page.locator('label[for="bg-alpha"]');
        const beta = page.locator('label[for="bg-beta"]');
        const gamma = page.locator('label[for="bg-gamma"]');

        await expect(alpha).toHaveCSS('border-top-left-radius', '6px');
        await expect(beta).toHaveCSS('border-top-left-radius', '0px');
        await expect(gamma).toHaveCSS('border-top-right-radius', '6px');

        await expectChecked(page, page.locator('#bg-alpha'), alpha);
        await expect(beta).toHaveCSS('background-color', INACTIVE_BACKGROUND);

        await beta.click();
        await expectChecked(page, page.locator('#bg-beta'), beta);
        await expect(alpha).toHaveCSS('background-color', INACTIVE_BACKGROUND);

        await page.locator('#bg-beta').focus();
        await page.keyboard.press('ArrowRight');
        await expectChecked(page, page.locator('#bg-gamma'), gamma);
        await expect(beta).toHaveCSS('background-color', INACTIVE_BACKGROUND);
    });

    test.eachFramework('Two button groups in one row hold their selections independently', async ({ page }) => {
        await ensureGridReady(page);
        await expect(page.locator('#bg-first-one')).toBeChecked();
        await expect(page.locator('#bg-second-four')).toBeChecked();

        await page.locator('label[for="bg-first-two"]').click();
        await expect(page.locator('#bg-first-two')).toBeChecked();
        await expect(page.locator('#bg-second-four')).toBeChecked();
    });

    test.eachFramework('Disabled controls and disabled control groups are dimmed', async ({ page }) => {
        await ensureGridReady(page);
        const disabledButton = page.locator('.example-controls button', { hasText: "I'm a disabled button" });
        await expect(disabledButton).toBeDisabled();
        await expect(disabledButton).toHaveCSS('opacity', '0.5');

        const fieldsetLabel = page.locator('label[for="bg-fieldset-other"]');
        await expect(fieldsetLabel).toHaveCSS('opacity', '0.5');
        await fieldsetLabel.click({ force: true });
        await expect(page.locator('#bg-fieldset-selected')).toBeChecked();
        await expect(page.locator('#bg-fieldset-other')).not.toBeChecked();
    });
});
