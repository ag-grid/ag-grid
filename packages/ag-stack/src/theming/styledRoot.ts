import type { UtilBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { IEnvironment } from '../interfaces/iEnvironment';
import { _getPageBody } from '../utils/document';
import { _createAgElement } from '../utils/dom';

const THEME_MODE_ATTRIBUTE = 'data-ag-theme-mode';
const THEME_MODE_ANCESTOR = `.ag-theme-mode[${THEME_MODE_ATTRIBUTE}]`;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _initDetachedStyledRoot(
    env: IEnvironment,
    child: HTMLElement
): [element: HTMLElement, destroy: () => void] {
    const [outer, inner] = _createStyledRootElements();
    inner.appendChild(child);
    const destroy = _initStyledRootFromInnerOfThreeElements(env, inner);
    return [outer, destroy];
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _initStyledRoot(env: IEnvironment, parent: HTMLElement | ShadowRoot, child: HTMLElement): () => void {
    const [element, destroy] = _initDetachedStyledRoot(env, child);
    parent.appendChild(element);
    return () => {
        destroy();
        element.remove();
    };
}

/**
 * Appends `child` in a styled root to the page body, for grid-owned elements that follow the pointer. The body is
 * outside the grid's nearest `.ag-theme-mode` ancestor, so that ancestor's theme mode is carried across.
 *
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _initPointerOverlay(
    beans: UtilBeanCollection,
    env: IEnvironment,
    child: HTMLElement
): (() => void) | undefined {
    const parent = _getPageBody(beans);
    if (!parent) {
        return undefined;
    }
    const [element, destroy] = _initDetachedStyledRoot(env, child);
    const mode = beans.eRootDiv.closest(THEME_MODE_ANCESTOR)?.getAttribute(THEME_MODE_ATTRIBUTE);
    const overlay = mode == null ? element : wrapInThemeMode(element, mode);
    parent.appendChild(overlay);
    return () => {
        destroy();
        overlay.remove();
    };
}

/** The styled root resets its own classes on theme change, so the mode goes on a wrapper. */
function wrapInThemeMode(element: HTMLElement, mode: string): HTMLElement {
    const wrapper = _createAgElement({ tag: 'div', cls: 'ag-theme-mode', attrs: { [THEME_MODE_ATTRIBUTE]: mode } });
    wrapper.appendChild(element);
    return wrapper;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _createStyledRootElements(): [outer: HTMLElement, inner: HTMLElement] {
    const el = { tag: 'div', cls: 'ag-styled-root' } as const;
    const outer = _createAgElement({ ...el, children: [{ ...el, children: [el] }] });
    return [outer, outer.firstElementChild!.firstElementChild as HTMLElement];
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _initStyledRootFromInnerOfThreeElements(
    env: IEnvironment,
    inner: HTMLElement,
    postApplyClasses?: () => void,
    hasAncestorStyledRoot?: boolean,
    legacyThemeClassesInherited?: boolean
): () => void {
    const middle = inner.parentElement!;
    const outer = middle.parentElement!;
    const applyClasses = () => {
        const [inheritClass, applyClass, directionClass] = env.getStyledRootClasses(
            hasAncestorStyledRoot,
            legacyThemeClassesInherited
        );
        outer.className = ['ag-styled-root', inheritClass].join(' ');
        middle.className = ['ag-styled-root', applyClass].join(' ');
        inner.className = ['ag-styled-root', directionClass].join(' ');
        postApplyClasses?.();
    };
    applyClasses();
    return env.onThemeChanged(applyClasses);
}
