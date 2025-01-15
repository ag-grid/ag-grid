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

let injectionsByContainer = new WeakMap<HTMLElement, InjectedStyle[]>();

export const _injectGlobalCSS = (
    css: string,
    styleContainer: HTMLElement,
    debugId: string,
    layer: string | undefined,
    priority: number
) => {
    if (IS_SSR) return;
    if (FORCE_LEGACY_THEMES) return;

    if (layer) {
        css = `@layer ${CSS.escape(layer)} { ${css} }`;
    }

    let injections = injectionsByContainer.get(styleContainer);
    if (!injections) {
        injections = [];
        injectionsByContainer.set(styleContainer, injections);
    }
    if (injections.find((i) => i.css === css)) return;

    const el = document.createElement('style');
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

export const _injectCoreAndModuleCSS = (styleContainer: HTMLElement, layer: string | undefined) => {
    _injectGlobalCSS(coreCSS, styleContainer, 'core', layer, 0);
    Array.from(_getAllRegisteredModules())
        .sort((a, b) => a.moduleName.localeCompare(b.moduleName))
        .forEach((module) =>
            module.css?.forEach((css) => _injectGlobalCSS(css, styleContainer, `module-${module.moduleName}`, layer, 0))
        );
};

const gridsUsingThemingAPI = new Set<object>();

export const _registerGridUsingThemingAPI = (environment: Environment) => {
    gridsUsingThemingAPI.add(environment);
};
export const _unregisterGridUsingThemingAPI = (environment: Environment) => {
    gridsUsingThemingAPI.delete(environment);
    if (gridsUsingThemingAPI.size === 0) {
        injectionsByContainer = new WeakMap();
        for (const style of document.head.querySelectorAll('style[data-ag-global-css]')) {
            style.remove();
        }
    }
};
