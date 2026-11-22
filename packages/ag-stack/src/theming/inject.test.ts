import { beforeAll, describe, expect, it, vi } from 'vitest';

import type { IEnvironment } from '../interfaces/iEnvironment';
import { VERSION } from '../version';
import {
    _injectGlobalCSS,
    _setStyleInjectionEnabledForTesting,
    _unregisterInstanceUsingThemingAPI,
    _useParamsCss,
} from './inject';

// Another version's copy registered first: hoisted above the imports, as inject.ts registers on import.
const { OTHER_VERSION, otherVersionState, versionMap } = vi.hoisted(() => {
    const otherVersionState = {};
    const versionMap = new Map<string, unknown>([['0.0.0-other', otherVersionState]]);
    (globalThis as { agStyleInjectionVersions?: Map<string, unknown> }).agStyleInjectionVersions = versionMap;
    return { OTHER_VERSION: '0.0.0-other', otherVersionState, versionMap };
});

const createEnvironment = (): IEnvironment => ({}) as IEnvironment;

const injectedStyles = (container: HTMLElement): HTMLStyleElement[] =>
    Array.from(container.querySelectorAll<HTMLStyleElement>('style[data-ag-css]'));

const injectedCssTexts = (container: HTMLElement): string[] =>
    injectedStyles(container).map((el) => el.textContent ?? '');

// IS_SSR is true under happy-dom (no document.fonts), so injection is off by default; force it on for these tests.
beforeAll(() => {
    _setStyleInjectionEnabledForTesting(true);
});

describe('style injection', () => {
    it("adds this version's state to another version's map, keeping that version's", () => {
        const windowMap = (globalThis as { agStyleInjectionVersions?: Map<string, unknown> }).agStyleInjectionVersions;
        expect(windowMap).toBe(versionMap);
        expect(Array.from(versionMap.keys())).toEqual([OTHER_VERSION, VERSION]);
        expect(versionMap.get(OTHER_VERSION)).toBe(otherVersionState);
    });

    it('deduplicates by css content', () => {
        const container = document.createElement('div');

        _injectGlobalCSS('.a {}', container, 'feature-a', undefined, 0, undefined);
        _injectGlobalCSS('.a {}', container, 'feature-a', undefined, 0, undefined);
        expect(injectedStyles(container)).toHaveLength(1);

        _injectGlobalCSS('.b {}', container, 'feature-b', undefined, 0, undefined);
        expect(injectedStyles(container)).toHaveLength(2);
    });

    it('orders injected styles by ascending priority regardless of insertion order', () => {
        const ascending = document.createElement('div');
        _injectGlobalCSS('.shared {}', ascending, 'shared', undefined, 0, undefined);
        _injectGlobalCSS('.params {}', ascending, 'params', undefined, 2, undefined);
        expect(injectedStyles(ascending).map((el) => el.dataset.agCss)).toEqual(['shared', 'params']);

        const descending = document.createElement('div');
        _injectGlobalCSS('.params {}', descending, 'params', undefined, 2, undefined);
        _injectGlobalCSS('.shared {}', descending, 'shared', undefined, 0, undefined);
        expect(injectedStyles(descending).map((el) => el.dataset.agCss)).toEqual(['shared', 'params']);
    });

    it('wraps css in @layer without escaping periods', () => {
        const container = document.createElement('div');

        _injectGlobalCSS('.a { color: red; }', container, 'feature-a', 'ag grid.base', 0, undefined);

        // Should escape space, not period
        expect(injectedCssTexts(container)[0]).toBe(String.raw`@layer ag\ grid.base { .a { color: red; } }`);
    });

    it('AG-17001: does not remove @layer wrapped styles when still in use', () => {
        const container = document.createElement('div');
        const paramsCss = '.params { --c: red; }';
        const envA = createEnvironment();
        const envB = createEnvironment();

        _useParamsCss(envA, paramsCss, 'params-shared', container, 'my-layer', undefined);
        _useParamsCss(envB, paramsCss, 'params-shared', container, 'my-layer', undefined);

        // envB still needs the params. Stale detection must match on raw css, not the
        // layer-wrapped css, or it would wrongly remove the still-in-use style.
        _unregisterInstanceUsingThemingAPI(envA);

        expect(injectedCssTexts(container)).toEqual([`@layer my-layer { ${paramsCss} }`]);
    });

    it('inserts as sibling after the container it is a style element', () => {
        const parent = document.createElement('div');
        const before = parent.appendChild(document.createElement('div'));
        const styleContainer = parent.appendChild(document.createElement('style'));
        const after = parent.appendChild(document.createElement('div'));

        _injectGlobalCSS('.a {}', styleContainer, 'feature-a', undefined, 0, undefined);

        const injected = styleContainer.nextElementSibling;
        expect((injected as HTMLStyleElement | null)?.dataset.agCss).toBe('feature-a');
        expect(injected?.nextElementSibling).toBe(after);
        expect(before.nextElementSibling).toBe(styleContainer);
    });

    it('replaces stale params css when a grid updates its params', () => {
        const container = document.createElement('div');
        const env = createEnvironment();

        _useParamsCss(env, '.params { --c: red; }', 'params-1', container, undefined, undefined);
        _useParamsCss(env, '.params { --c: blue; }', 'params-1', container, undefined, undefined);

        expect(injectedCssTexts(container)).toEqual(['.params { --c: blue; }']);
    });
});
