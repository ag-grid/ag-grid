import type { IEnvironment } from '../interfaces/iEnvironment';
import { sharedCSS } from './shared/shared.css-GENERATED';

export const IS_SSR = typeof window !== 'object' || !window?.document?.fonts?.forEach;

/** For testing, if true, only Vanilla examples will work and they will use legacy themes. */
export const FORCE_LEGACY_THEMES = false;

type InjectedStyle = {
    css: string;
    el: HTMLStyleElement;
    priority: number;
    isParams: boolean;
};

export const _injectGlobalCSS = (
    css: string,
    styleContainer: HTMLElement,
    debugId: string,
    layer: string | undefined,
    priority: number,
    nonce: string | undefined,
    isParams: boolean = false
) => {
    if (IS_SSR || FORCE_LEGACY_THEMES) {
        return;
    }

    if (layer) {
        // Layer names need regular ident escaping except that they may contain periods
        // https://drafts.csswg.org/css-cascade-5/#layer-names
        css = `@layer ${CSS.escape(layer).replaceAll('\\.', '.')} { ${css} }`;
    }

    let injections = injectionState.map.get(styleContainer);
    if (!injections) {
        injections = [];
        injectionState.map.set(styleContainer, injections);
    }
    if (injections.some((i) => i.css === css)) {
        return;
    }

    const el = document.createElement('style');
    if (nonce) {
        el.setAttribute('nonce', nonce);
    }
    el.dataset.agGlobalCss = debugId;
    el.textContent = css;
    const newInjection: InjectedStyle = { css, el, priority, isParams };

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
    if (IS_SSR || FORCE_LEGACY_THEMES) {
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
        if (deleteAll || (injections[i].isParams && !neededCss.has(injections[i].css))) {
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
};

type WindowState = {
    agStyleInjectionState?: InjectionState;
};

// AG-14716 - for customers using module federation, there may be many
// instances of this module, but we want to ensure that there is only
// one instance of the container to injection map per window otherwise
// unmounting any grid instance will clear all styles from the page
// resulting in unstyled grids
const injectionState: InjectionState = ((typeof window === 'object'
    ? (window as WindowState)
    : {}
).agStyleInjectionState ??= {
    map: new WeakMap(),
    grids: new Map(),
});
