import { _setStyleInjectionEnabledForTesting } from 'ag-stack';
import { TestGridsManager } from 'ag-test-utils';

import { inputStyleBordered, inputStyleUnderlined, themeQuartz } from 'ag-grid-community';

import { VERSION } from '../version';

const agStyles = (): HTMLStyleElement[] =>
    Array.from(document.head.querySelectorAll<HTMLStyleElement>('style[data-ag-css]'));

const allDebugIds = () => agStyles().map((el) => el.dataset.agCss ?? '');
const paramsDebugIds = () => allDebugIds().filter((id) => id.startsWith('ag-theme-params'));
const inputStyleDebugIds = () => allDebugIds().filter((id) => id.startsWith('ag-theme-inputStyle'));

const cssFor = (debugId: string): string => agStyles().find((el) => el.dataset.agCss === debugId)?.textContent ?? '';

const injectionVersions = () => (globalThis as WindowState).agStyleInjectionVersions!;

describe('theme style injection across grids', () => {
    const gridsManager = new TestGridsManager({ modules: [] });

    // IS_SSR is true under happy-dom (no document.fonts) so grids don't inject by default; force it on here.
    beforeEach(() => {
        _setStyleInjectionEnabledForTesting(true);
    });

    afterEach(() => {
        gridsManager.reset();
    });

    afterAll(() => {
        _setStyleInjectionEnabledForTesting(false);
    });

    it('shares per-version state across grids with different parts and cleans up styles incrementally', async () => {
        const columnDefs = [{ field: 'a' }];
        const rowData = [{ a: 1 }];

        const gridA = await gridsManager.createGridAndWait('gridA', {
            theme: themeQuartz.withPart(inputStyleBordered),
            columnDefs,
            rowData,
        });

        expect(injectionVersions().has(VERSION)).toBe(true);
        const versionCount = injectionVersions().size;

        // Every injected style is tagged with the current version.
        expect(agStyles().every((el) => el.dataset.agCssVersion === VERSION)).toBe(true);

        // Grid A injects its input-style part css and its own params.
        expect(inputStyleDebugIds()).toHaveLength(1);
        expect(paramsDebugIds()).toHaveLength(1);
        const paramsA = paramsDebugIds()[0];

        // Real theme css reached the DOM, asserted on the css itself: happy-dom cannot parse any of it, so
        // its parser is no witness to what was injected.
        expect(cssFor(paramsA)).toContain('--ag-accent-color');

        const inputStyleA = inputStyleDebugIds()[0];
        const styleCountAfterA = allDebugIds().length;

        const gridB = await gridsManager.createGridAndWait('gridB', {
            theme: themeQuartz.withPart(inputStyleUnderlined),
            columnDefs,
            rowData,
        });

        // B shares A's version entry — no new key.
        expect(injectionVersions().size).toBe(versionCount);

        // B injects a second, distinct input-style part with different css — real part-css injection.
        expect(inputStyleDebugIds()).toHaveLength(2);
        expect(inputStyleDebugIds()[0]).toEqual(inputStyleA);
        const inputStyleB = inputStyleDebugIds()[1];
        expect(cssFor(inputStyleA)).toBeTruthy();
        expect(cssFor(inputStyleA)).not.toBe(cssFor(inputStyleB));

        // B adds its own params; the default parts it shares with A are deduped, not re-injected.
        expect(paramsDebugIds()).toHaveLength(2);
        expect(paramsDebugIds()[0]).toBe(paramsA);
        const styleCountAfterB = allDebugIds().length;
        // B should only have added its params and an input style
        expect(styleCountAfterB).toEqual(styleCountAfterA + 2);

        // Destroying A removes ONLY its params; its part css and the shared css survive while B lives.
        gridA.destroy();
        expect(allDebugIds()).not.toContain(paramsA);
        expect(allDebugIds().length).toBe(styleCountAfterB - 1);

        // Destroying the last grid clears every injected style from the head.
        gridB.destroy();
        expect(agStyles()).toHaveLength(0);
    });
});

type WindowState = {
    agStyleInjectionVersions?: Map<string, unknown>;
};
