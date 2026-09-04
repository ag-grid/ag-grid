import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';

// `.css` imports resolve to an empty string under the package vitest config, so read the shipped file.
const css = fs.readFileSync(path.join(__dirname, 'button-style-base.css'), 'utf-8');

function indexOfDeclaration(property: string): number {
    const index = css.indexOf(property);
    expect(index, `expected \`${property}\` in button-style-base.css`).toBeGreaterThan(-1);
    return index;
}

describe('button style base CSS', () => {
    // Part CSS is injected inside a zero-specificity `:where()` wrapper, so source order alone
    // decides between the equal-specificity `:hover` and `:active` rules.
    it('declares the hover state before the active state so a press is not overridden by hover', () => {
        expect(indexOfDeclaration('--ag-button-hover-background-color')).toBeLessThan(
            indexOfDeclaration('--ag-button-active-background-color')
        );
    });

    it('declares the disabled state last so it wins over both hover and active', () => {
        const disabled = indexOfDeclaration('--ag-button-disabled-background-color');
        expect(disabled).toBeGreaterThan(indexOfDeclaration('--ag-button-hover-background-color'));
        expect(disabled).toBeGreaterThan(indexOfDeclaration('--ag-button-active-background-color'));
    });
});
