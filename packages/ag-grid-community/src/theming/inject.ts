import type { Environment } from '../environment';
import { _getAllRegisteredModules } from '../modules/moduleRegistry';
import { FORCE_LEGACY_THEMES } from './Theme';
import { coreCSS } from './core/core.css-GENERATED';

export const IS_SSR = typeof window !== 'object' || !window?.document?.fonts?.forEach;

type InjectedStyle = {
    css: string;
    el: HTMLStyleElement;
    priority: number;
};

export const _injectGlobalCSS = (
    css: string,
    styleContainer: HTMLElement,
    debugId: string,
    layer: string | undefined,
    priority: number,
    nonce: string | undefined
) => {
    if (IS_SSR) return;
    if (FORCE_LEGACY_THEMES) return;

    if (layer) {
        css = `@layer ${CSS.escape(layer)} { ${css} }`;
    }

    let injections = injectionState.map.get(styleContainer);
    if (!injections) {
        injections = [];
        injectionState.map.set(styleContainer, injections);
    }
    if (injections.find((i) => i.css === css)) return;

    const el = document.createElement('style');
    if (nonce) {
        el.setAttribute('nonce', nonce);
    }
    el.dataset.agGlobalCss = debugId;
    el.textContent = css;
    const newInjection = { css, el, priority };

    let insertAfter: InjectedStyle | undefined;
    for (const injection of injections) {
        if (injection.priority > priority) break;
        insertAfter = injection;
    }
    if (insertAfter) {
        insertAfter.el.insertAdjacentElement('afterend', el);
        const index = injections.indexOf(insertAfter);
        injections.splice(index + 1, 0, newInjection);
    } else {
        styleContainer.insertBefore(el, styleContainer.querySelector(':not(title, meta)'));
        injections.push(newInjection);
    }
};

export const _injectCoreAndModuleCSS = (
    styleContainer: HTMLElement,
    layer: string | undefined,
    nonce: string | undefined
) => {
    _injectGlobalCSS(coreCSS, styleContainer, 'core', layer, 0, nonce);
    Array.from(_getAllRegisteredModules())
        .sort((a, b) => a.moduleName.localeCompare(b.moduleName))
        .forEach((module) =>
            module.css?.forEach((css) =>
                _injectGlobalCSS(css, styleContainer, `module-${module.moduleName}`, layer, 0, nonce)
            )
        );
};

export const _registerGridUsingThemingAPI = (environment: Environment) => {
    injectionState.grids.add(environment);
};
export const _unregisterGridUsingThemingAPI = (environment: Environment) => {
    injectionState.grids.delete(environment);
    if (injectionState.grids.size === 0) {
        injectionState.map = new WeakMap();
        for (const style of document.head.querySelectorAll('style[data-ag-global-css]')) {
            style.remove();
        }
    }
};

type InjectionState = {
    // Set of grids that are using the theming API
    grids: Set<object>;
    // Map of style containers to injected styles
    map: WeakMap<HTMLElement, InjectedStyle[]>;
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
    grids: new Set(),
});
