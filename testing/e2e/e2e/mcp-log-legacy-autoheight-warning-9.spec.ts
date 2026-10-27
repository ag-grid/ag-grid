/*
 * Issue: with `theme: 'legacy'` and the legacy CSS files loaded, a grid using `domLayout: 'autoHeight'` logs
 * warning #9 ("No value for `--ag-auto-height-max-body-height`. This usually means that the grid has been
 * initialised before styles have been loaded"), even though the styles are loaded.
 *
 * Setup: ag-grid.css and ag-theme-quartz.css are in the page before the grid is created, the container has the
 * `ag-theme-quartz` class, and the grid uses `theme: 'legacy'` with `domLayout: 'autoHeight'`.
 *
 * Expected: no warning #9. The warning is meant for grids created before styles have loaded (it says so), and a
 * legacy theme with autoHeight is a supported setup. The theming migration docs describe `theme: 'legacy'` with
 * the legacy CSS files as the supported way to keep the v32 themes. The variable has a default (no maximum),
 * which should be used silently.
 *
 * Actual: the grid measures `--ag-auto-height-max-body-height`, which only the Theming API's core CSS defines.
 * The legacy CSS does not define it, so the measurement is treated as "no styles" and warning #9 is logged.
 *
 * Reported on grid versions: Vue 36.0.0 and React 35.1.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). Coding agents on Vue 36.0.0 (September 2026) and React
 * 35.1.0 (April 2026) searched for things like "error 9 grid initialised before styles loaded CSS variable default
 * value auto-height-max-body-height" and "grid initialised before styles loaded CSS variable --ag-header-row-border
 * error 9 multiple grids same page autoHeight".
 */
import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

import { mountGrid } from '../src/mountGrid';

const STYLES = path.join(__dirname, '../../../packages/ag-grid-community/styles');
const legacyCss = ['ag-grid.css', 'ag-theme-quartz.css']
    .map((file) => fs.readFileSync(path.join(STYLES, file), 'utf8'))
    .join('\n');

test('legacy theme with autoHeight does not warn that styles are missing', async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', (msg) => {
        if (msg.type() === 'warning' || msg.type() === 'error') {
            warnings.push(msg.text());
        }
    });

    const { cell } = await mountGrid(page, {
        className: 'ag-theme-quartz',
        css: legacyCss,
        options: () => ({
            theme: 'legacy',
            domLayout: 'autoHeight',
            columnDefs: [{ field: 'a' }],
            rowData: [{ a: 1 }],
        }),
    });
    await cell(0, 'a').waitFor();

    const stylesNotLoaded = () => warnings.filter((w) => /warning #9\b|No value for `--ag-/.test(w));
    await expect.poll(stylesNotLoaded).toEqual([]);
});
