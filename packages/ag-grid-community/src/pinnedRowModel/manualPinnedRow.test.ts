import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';

const CSS_PATH = path.join(__dirname, 'manualPinnedRow.css');

// `.css` imports resolve to an empty string under the package vitest config, so read the shipped file.
function selectorForPinnedRowBackground(): string {
    const css = fs.readFileSync(CSS_PATH, 'utf-8');
    const rules = css.match(/[^{}]+\{[^{}]*\}/g) ?? [];
    const rule = rules.find((r) => r.includes('var(--ag-pinned-row-background-color)'));
    expect(rule, 'expected a rule declaring var(--ag-pinned-row-background-color)').toBeDefined();
    return rule!.slice(0, rule!.indexOf('{')).trim();
}

describe('pinned row background CSS', () => {
    it('applies pinnedRowBackgroundColor to rows set via pinnedTopRowData / pinnedBottomRowData', () => {
        const selector = selectorForPinnedRowBackground();

        // Floating rows (pinnedTopRowData / pinnedBottomRowData) carry ag-row-pinned without -manual.
        const floatingRow = document.createElement('div');
        floatingRow.className = 'ag-row ag-row-pinned';
        expect(floatingRow.matches(selector)).toBe(true);

        // Manually pinned rows carry both classes and must keep the colour.
        const manualRow = document.createElement('div');
        manualRow.className = 'ag-row ag-row-pinned ag-row-pinned-manual';
        expect(manualRow.matches(selector)).toBe(true);
    });
});
