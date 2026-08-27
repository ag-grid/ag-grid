import type { Page } from '@playwright/test';
import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

const ALL_THEMES = [
    'Quartz',
    'Quartz Dark',
    'Alpine',
    'Alpine Dark',
    'Balham',
    'Balham Dark',
    'Material',
    'Material Dark',
];

// The two states the AG-18347 reporter screenshotted. The paint assertion below is only run for
// these: it is the expensive, screenshot-based half of the check, and the defect is a property of
// the theme-agnostic base stylesheet, so verifying it once per colour scheme is representative.
// Every theme still gets the cheap structural check.
const PAINT_CHECKED_THEMES = ['Quartz', 'Quartz Dark'];

const HIDE_ICON_STYLE_ID = 'ag-18347-hide-toolbar-input-icon';

async function useTheme(page: Page, theme: string) {
    await page.getByRole('button', { name: theme, exact: true }).click();
}

function toolbarInput(page: Page) {
    return page.locator('.ag-toolbar-input').first();
}

async function expectIconHasABox(page: Page) {
    const icon = toolbarInput(page).locator('.ag-toolbar-input-icon');
    await expect(icon).toBeAttached();
    const box = await icon.boundingBox();
    expect(box?.width ?? 0, 'filter icon width').toBeGreaterThan(0);
    expect(box?.height ?? 0, 'filter icon height').toBeGreaterThan(0);
}

/**
 * Assert the quick-filter icon is actually PAINTED inside the toolbar input.
 *
 * AG-18347 is a paint-order defect: the icon is in the DOM with a non-zero box and the input
 * reserves padding for it, but the input's opaque background paints over the glyph — so a DOM or
 * bounding-box assertion passes on a broken build. Two element screenshots of the same input,
 * taken back to back with only the icon's presence differing, assert the reporter-visible symptom
 * and need no stored baseline, so font rendering differences between machines cannot bite.
 *
 * `document.elementFromPoint` is deliberately not used: the icon sets `pointer-events: none`, so
 * hit-testing skips it whether or not it is visible.
 */
async function setIconHidden(page: Page, hidden: boolean) {
    await page.evaluate(
        ({ id, hide }) => {
            document.getElementById(id)?.remove();
            if (!hide) {
                return;
            }
            const style = document.createElement('style');
            style.id = id;
            style.textContent = '.ag-toolbar-input-icon { display: none !important; }';
            document.head.appendChild(style);
        },
        { id: HIDE_ICON_STYLE_ID, hide: hidden }
    );
}

async function expectIconPainted(page: Page) {
    const input = toolbarInput(page);
    await expect(input).toBeVisible();

    const shoot = () => input.screenshot({ animations: 'disabled', caret: 'hide' });

    const withIcon = await shoot();
    await setIconHidden(page, true);
    try {
        const withoutIcon = await shoot();
        expect(withIcon.equals(withoutIcon), 'hiding the filter icon changed nothing, so it painted no pixels').toBe(
            false
        );
    } finally {
        await setIconHidden(page, false);
    }
}

async function checkLegacyThemes(page: Page) {
    await ensureGridReady(page);

    for (const theme of ALL_THEMES) {
        await useTheme(page, theme);
        await expectIconHasABox(page);

        if (PAINT_CHECKED_THEMES.includes(theme)) {
            await expectIconPainted(page);
        }
    }
}

test.agExample(import.meta, () => {
    test.typescript('quick filter toolbar icon is visible in every legacy theme', async ({ page }) => {
        await checkLegacyThemes(page);
    });

    test.vanilla('quick filter toolbar icon is visible in every legacy theme', async ({ page }) => {
        await checkLegacyThemes(page);
    });
});
