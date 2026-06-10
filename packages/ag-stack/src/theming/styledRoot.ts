import type { IEnvironment } from '../interfaces/iEnvironment';
import { _createAgElement } from '../utils/dom';

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
    postApplyClasses?: () => void
): () => void {
    const middle = inner.parentElement!;
    const outer = middle.parentElement!;
    const applyClasses = () => {
        const [inheritClass, applyClass, directionClass] = env.getStyledRootClasses();
        outer.className = ['ag-styled-root', inheritClass].join(' ');
        middle.className = ['ag-styled-root', applyClass].join(' ');
        inner.className = ['ag-styled-root', directionClass].join(' ');
        postApplyClasses?.();
    };
    applyClasses();
    return env.onThemeChanged(applyClasses);
}
