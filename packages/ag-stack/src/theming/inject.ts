import type { IEnvironment } from '../interfaces/iEnvironment';
import { VERSION } from '../version';
import sharedCSS from './shared/shared.css';

const IS_SSR = typeof window !== 'object' || !window?.document?.fonts?.forEach;

/** For testing, if true, only Vanilla examples will work and they will use legacy themes. */
export const FORCE_LEGACY_THEMES = false;

let styleInjectionForcedForTesting = false;

/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const _setStyleInjectionEnabledForTesting = (enabled: boolean): void => {
    styleInjectionForcedForTesting = enabled;
};

/** @internal True when injection must be skipped: no DOM (unless force-enabled for tests) or legacy themes. */
export const _isStyleInjectionDisabled = (): boolean =>
    (IS_SSR && !styleInjectionForcedForTesting) || FORCE_LEGACY_THEMES;

type InjectedStyle = {
    rawCss: string;
    injectedCss: string;
    el: HTMLStyleElement;
    priority: number;
    isParams: boolean;
};

export const _injectGlobalCSS = (
    rawCss: string,
    styleContainer: HTMLElement,
    debugId: string,
    layer: string | undefined,
    priority: number,
    nonce: string | undefined,
    isParams: boolean = false
) => {
    if (_isStyleInjectionDisabled()) {
        return;
    }

    let injectedCss = rawCss;
    if (layer) {
        // Layer names need regular ident escaping except that they may contain periods
        // https://drafts.csswg.org/css-cascade-5/#layer-names
        injectedCss = `@layer ${CSS.escape(layer).replaceAll('\\.', '.')} { ${rawCss} }`;
    }

    let injections = injectionState.map.get(styleContainer);
    if (!injections) {
        injections = [];
        injectionState.map.set(styleContainer, injections);
    }
    if (injections.some((i) => i.injectedCss === injectedCss)) {
        return;
    }

    const el = document.createElement('style');
    if (nonce) {
        el.setAttribute('nonce', nonce);
    }
    el.dataset.agCss = debugId;
    el.dataset.agCssVersion = VERSION;
    el.textContent = injectedCss;
    const newInjection: InjectedStyle = { rawCss, injectedCss, el, priority, isParams };

    let insertAfter: InjectedStyle | undefined;
    for (const injection of injections) {
        if (injection.priority > priority) {
            break;
        }
        insertAfter = injection;
    }
    if (insertAfter) {
        insertAfter.el.after(el);
        const index = injections.indexOf(insertAfter);
        injections.splice(index + 1, 0, newInjection);
    } else {
        if (styleContainer.nodeName === 'STYLE') {
            styleContainer.after(el);
        } else {
            styleContainer.insertBefore(el, styleContainer.querySelector(':not(title, meta)'));
        }
        injections.push(newInjection);
    }
};

export const _injectCoreAndModuleCSS = (
    styleContainer: HTMLElement,
    layer: string | undefined,
    nonce: string | undefined,
    moduleCss: Map<string, string[]> | undefined
) => {
    _injectGlobalCSS(sharedCSS, styleContainer, 'shared', layer, 0, nonce);
    moduleCss?.forEach((css, debugId) =>
        css.forEach((singleCss) => _injectGlobalCSS(singleCss, styleContainer, debugId, layer, 0, nonce))
    );
};

export const _useParamsCss = (
    environment: IEnvironment,
    paramsCss: string | null,
    paramsDebugId: string | null,
    styleContainer: HTMLElement,
    layer: string | undefined,
    nonce: string | undefined
) => {
    if (_isStyleInjectionDisabled()) {
        return;
    }

    const gridState = injectionState.grids.get(environment);
    if (!gridState) {
        injectionState.grids.set(environment, { styleContainer, paramsCss });
    } else {
        gridState.paramsCss = paramsCss;
    }

    removeStaleParamsCss(styleContainer);

    if (paramsCss && paramsDebugId) {
        _injectGlobalCSS(paramsCss, styleContainer, paramsDebugId, layer, 2, nonce, true);
    }
};

export const _unregisterInstanceUsingThemingAPI = (environment: IEnvironment) => {
    const styleContainer = injectionState.grids.get(environment)?.styleContainer;
    if (!styleContainer) {
        return;
    }
    injectionState.grids.delete(environment);

    const containerStillInUse = Array.from(injectionState.grids.values()).some(
        (gs) => gs.styleContainer === styleContainer
    );
    if (containerStillInUse) {
        removeStaleParamsCss(styleContainer);
    } else {
        removeStaleParamsCss(styleContainer, true);
        injectionState.map.delete(styleContainer);
    }
};

const removeStaleParamsCss = (styleContainer: HTMLElement, deleteAll = false) => {
    const neededCss = new Set();
    for (const gs of injectionState.grids.values()) {
        if (gs.styleContainer === styleContainer) {
            neededCss.add(gs.paramsCss);
        }
    }

    const injections = injectionState.map.get(styleContainer) ?? [];
    for (let i = injections.length - 1; i >= 0; i--) {
        if (deleteAll || (injections[i].isParams && !neededCss.has(injections[i].rawCss))) {
            injections[i].el.remove();
            injections.splice(i, 1);
        }
    }
};

type InjectedGridCssState = {
    styleContainer: HTMLElement;
    paramsCss: string | null;
};

type InjectionState = {
    // Map of style containers to injected styles
    map: WeakMap<HTMLElement, InjectedStyle[]>;
    // Map of environments to their grid state
    grids: Map<IEnvironment, InjectedGridCssState>;
    // Counter for generating unique params class names
    paramsId: number;
};

// IMPORTANT: this global API on the window object must remain constant across
// versions. Each version is free to change the structure of InjectionState, but
// the contract of "agStyleInjectionVersions" is that it is map of version to
// that version's state.
type WindowState = {
    agStyleInjectionVersions?: Map<string, InjectionState>;
};

// When many copies of the grid are loaded (either due to module federation or
// just multiple scripts each embedding a copy of the library), there may be
// many instances of this module, which may be different versions or not. Our
// requirement is that all grid instances sharing the same style context (the
// main document or any one shadow DOM) must have exactly the same version. If
// two independent modules share the same version, they will share the same
// InjectionState and cooperate on inserting the correct styles. Different
// versions get their own state, meaning that they will insert their own CSS.
// Provided that different versions never share style contexts this will not
// cause issues. If they do, both versions' styles will be injected and the
// result will be obvious in development tools because of the
// data-ag-css-version attribute on each style element.
export const getInjectionState = (): InjectionState => {
    const versionMap = ((globalThis as WindowState).agStyleInjectionVersions ??= new Map());
    let state = versionMap.get(VERSION);
    if (!state) {
        state = {
            map: new WeakMap(),
            grids: new Map(),
            paramsId: 0,
        };
        versionMap.set(VERSION, state);
    }
    return state;
};

const injectionState = getInjectionState();
