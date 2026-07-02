import { _setStyleInjectionEnabledForTesting } from 'ag-stack';
import { vi } from 'vitest';

import { inputStyleBordered, inputStyleUnderlined, themeQuartz } from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';
import { VERSION } from '../version';

// The version map is registered as an import-time side effect of inject.ts (its
// module-level getInjectionState() call), not at grid creation. Seed a foreign
// version before that import runs to prove a newly-loaded version reuses the
// existing map rather than replacing it - hence vi.hoisted, which executes before
// the imports above; a beforeEach would run too late.
const { DUMMY_VERSION } = vi.hoisted(() => {
    const windowState = globalThis as WindowState;
    if (windowState.agStyleInjectionVersions) {
        throw new Error('This should have run before the ag import');
    }
    const DUMMY_VERSION = '0.0.0-dummy';
    windowState.agStyleInjectionVersions = new Map([[DUMMY_VERSION, {}]]);
    return { DUMMY_VERSION };
});

const agStyles = (): HTMLStyleElement[] =>
    Array.from(document.head.querySelectorAll<HTMLStyleElement>('style[data-ag-css]'));

const allDebugIds = () => agStyles().map((el) => el.dataset.agCss ?? '');
const paramsDebugIds = () => allDebugIds().filter((id) => id.startsWith('ag-theme-params'));
const inputStyleDebugIds = () => allDebugIds().filter((id) => id.startsWith('ag-theme-inputStyle'));

const cssFor = (debugId: string): string => agStyles().find((el) => el.dataset.agCss === debugId)?.textContent ?? '';

const injectionVersions = () => (globalThis as WindowState).agStyleInjectionVersions!;

describe('theme style injection across grids', () => {
    const gridsManager = new TestGridsManager({ modules: [] });

    // jsdom's CSS parser rejects the Theming API's modern CSS (nested rules, @layer, color-mix), reporting
    // "Could not parse CSS stylesheet" via console.error; real browsers accept it. Swallow only that error and
    // count it (so the test can prove injection happened), letting every other console.error through.
    let cssParseErrors = 0;
    let realConsoleError: typeof console.error;

    // IS_SSR is true under jsdom (no document.fonts) so grids don't inject by default; force it on here.
    beforeEach(() => {
        _setStyleInjectionEnabledForTesting(true);
        cssParseErrors = 0;
        realConsoleError = console.error;
        console.error = (...args: unknown[]): void => {
            if (typeof args[0] === 'string' && args[0].includes('Could not parse CSS stylesheet')) {
                cssParseErrors++;
                return;
            }
            realConsoleError.apply(console, args);
        };
    });

    afterEach(() => {
        console.error = realConsoleError;
        gridsManager.reset();
    });

    it('shares per-version state across grids with different parts and cleans up styles incrementally', async () => {
        const columnDefs = [{ field: 'a' }];
        const rowData = [{ a: 1 }];

        const gridA = await gridsManager.createGridAndWait('gridA', {
            theme: themeQuartz.withPart(inputStyleBordered),
            columnDefs,
            rowData,
        });

        // The grid added its own version alongside the seeded dummy, without replacing the map.
        expect(injectionVersions()).toBeInstanceOf(Map);
        expect(Array.from(injectionVersions().keys())).toEqual([DUMMY_VERSION, VERSION]);

        // Every injected style is tagged with the current version.
        expect(agStyles().every((el) => el.dataset.agCssVersion === VERSION)).toBe(true);

        // Grid A injects its input-style part css and its own params.
        expect(inputStyleDebugIds()).toHaveLength(1);
        expect(paramsDebugIds()).toEqual(['ag-theme-params-1']);

        // jsdom rejected the injected (nested) part css — proof real theme css reached the DOM.
        expect(cssParseErrors).toBeGreaterThan(0);

        const inputStyleA = inputStyleDebugIds()[0];
        const styleCountAfterA = allDebugIds().length;

        const gridB = await gridsManager.createGridAndWait('gridB', {
            theme: themeQuartz.withPart(inputStyleUnderlined),
            columnDefs,
            rowData,
        });

        // B shares A's version entry — no new key.
        expect(Array.from(injectionVersions().keys())).toEqual([DUMMY_VERSION, VERSION]);

        // B injects a second, distinct input-style part with different css — real part-css injection.
        expect(inputStyleDebugIds()).toHaveLength(2);
        expect(inputStyleDebugIds()[0]).toEqual(inputStyleA);
        const inputStyleB = inputStyleDebugIds()[1];
        expect(cssFor(inputStyleA)).toBeTruthy();
        expect(cssFor(inputStyleA)).not.toBe(cssFor(inputStyleB));

        // B adds its own params; the default parts it shares with A are deduped, not re-injected.
        expect(paramsDebugIds()).toEqual(['ag-theme-params-1', 'ag-theme-params-2']);
        const styleCountAfterB = allDebugIds().length;
        // B should only have added its params and an input style
        expect(styleCountAfterB).toEqual(styleCountAfterA + 2);

        // Destroying A removes ONLY its params; its part css and the shared css survive while B lives.
        gridA.destroy();
        expect(allDebugIds()).not.toContain('ag-theme-params-1');
        expect(allDebugIds().length).toBe(styleCountAfterB - 1);

        // Destroying the last grid clears every injected style from the head.
        gridB.destroy();
        expect(agStyles()).toHaveLength(0);
    });
});

type WindowState = {
    agStyleInjectionVersions?: Map<string, unknown>;
};
