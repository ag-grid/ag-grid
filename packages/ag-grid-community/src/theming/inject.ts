import type { CoreBeanCollection } from '../context/context';

type Injection = {
    css: Set<string>;
    last?: HTMLStyleElement;
};

const injections = new WeakMap<HTMLElement, Injection>();

export const _injectComponentCSS = (css: string | undefined, beans: CoreBeanCollection) => {
    _injectGlobalCSS(css, beans.eGridDiv);
};

export const _injectGlobalCSS = (css: string | undefined, container: HTMLElement) => {
    if (!css) return;

    const root = container.getRootNode() === document ? document.head : container;

    let injection = injections.get(root);
    if (!injection) {
        injection = { css: new Set() };
        injections.set(root, injection);
    }
    if (injection.css.has(css)) return;

    const style = document.createElement('style');
    style.dataset.agGlobalCss = '';
    style.textContent = css;

    if (injection.last) {
        injection.last.insertAdjacentElement('afterend', style);
    } else if (root.firstElementChild) {
        root.firstElementChild.insertAdjacentElement('beforebegin', style);
    } else {
        root.appendChild(style);
    }

    injection.css.add(css);
    injection.last = style;
};
