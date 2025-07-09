import { _setAriaHidden } from './ariaUtils';

export function _setDisplayed(element: Element, displayed: boolean, options: { skipAriaHidden?: boolean } = {}) {
    const { skipAriaHidden } = options;
    element.classList.toggle('ag-hidden', !displayed);
    if (!skipAriaHidden) {
        _setAriaHidden(element, !displayed);
    }
}

export function _setVisible(element: HTMLElement, visible: boolean, options: { skipAriaHidden?: boolean } = {}) {
    const { skipAriaHidden } = options;
    element.classList.toggle('ag-invisible', !visible);
    if (!skipAriaHidden) {
        _setAriaHidden(element, !visible);
    }
}

/**
 * Loads the template and returns it as an element.
 * NOTE: Prefer _createElement
 * @param {string} template
 * @returns {HTMLElement}
 */
export function _loadTemplate(template: string | undefined | null): HTMLElement {
    const tempDiv = document.createElement('div');
    // eslint-disable-next-line no-restricted-properties -- no other way to parse custom HTML strings from the user
    tempDiv.innerHTML = (template || '').trim();

    return tempDiv.firstChild as HTMLElement;
}

export function _isNodeOrElement(o: any): o is Node | Element {
    return o instanceof Node || o instanceof HTMLElement;
}

export type Attributes = { [key: string]: string };
type TagName<SelectorType extends string> = keyof HTMLElementTagNameMap | Lowercase<SelectorType>;
/** Type to help avoid typos, add new roles as required. */
type RoleType =
    | 'button'
    | 'columnheader'
    | 'gridcell'
    | 'heading'
    | 'menu'
    | 'option'
    | 'presentation'
    | 'role'
    | 'row'
    | 'rowgroup'
    | 'status'
    | 'tab'
    | 'tablist'
    | 'tabpanel'
    | 'treeitem';

export type AgElementParams<SelectorType extends string> = {
    /** The tag name to use for the element, either browser tag or one of the AG Grid components such as ag-checkbox
     */
    tag: TagName<SelectorType>;
    /** AG Grid data-ref attribute, should match a property on the class that uses the same name and is initialised with RefPlaceholder
     * @example
     * ref: 'eLabel'
     * private eLabel: HTMLElement = RefPlaceholder;
     */
    ref?: string;
    /**
     * Should be a single string of space-separated class names
     * @example
     * cls: 'ag-header-cell ag-header-cell-sortable'
     */
    cls?: string;

    /** The role attribute to add to the dom element */
    role?: RoleType;

    /** Key Value pair of attributes to add to the dom element via `element.setAttribute(key,value)` */
    attrs?: Attributes;

    /**
     * A single string can be passed to the children property and this will call `element.textContent = children` on the element.
     *
     * Otherwise an array of children is passed.
     * A child element can be an ElementParams / string / (() => Element) / null/undefined.
     *  - If an ElementParams is passed it will be created and appended to the parent element. It will be wrapped with whitespace to mimic the previous behaviour of multi line strings.
     *  - If a string is passed it will be appended as a text node.
     *  - If a function is passed, it will be called and the result appended
     *  - If null or undefined is passed it will be ignored.
     */
    children?: (AgElementParams<SelectorType> | string | (() => Element) | null | undefined)[] | string;
};

/** AG Grid attribute used to automatically assign DOM Elements to class properties */
export const DataRefAttribute = 'data-ref';

let whitespaceNode: Node | null;
function getWhitespaceNode() {
    // Cloning is slightly faster than creating a new node each time
    whitespaceNode ??= document.createTextNode(' ');
    return whitespaceNode.cloneNode();
}
export function _createAgElement<T extends HTMLElement = HTMLElement, TComponentSelector extends string = string>(
    params: AgElementParams<TComponentSelector>
): T {
    const { attrs, children, cls, ref, role, tag } = params;
    const element = document.createElement(tag);

    if (cls) {
        element.className = cls;
    }
    if (ref) {
        element.setAttribute(DataRefAttribute, ref);
    }
    if (role) {
        element.setAttribute('role', role);
    }

    if (attrs) {
        for (const key of Object.keys(attrs)) {
            element.setAttribute(key, attrs[key]);
        }
    }

    if (children) {
        if (typeof children === 'string') {
            element.textContent = children;
        } else {
            let addFirstWhitespace = true;
            for (const child of children) {
                if (child) {
                    if (typeof child === 'string') {
                        element.appendChild(document.createTextNode(child));
                        addFirstWhitespace = false;
                    } else if (typeof child === 'function') {
                        element.appendChild(child());
                    } else {
                        // NOTE: To match the previous behaviour of when component templates where defined on multi line strings we need
                        // to add a whitespace node before and after each child element.
                        // Ideally we would not do this but this reduces the chance of breaking changes.
                        if (addFirstWhitespace) {
                            element.appendChild(getWhitespaceNode());
                            addFirstWhitespace = false;
                        }
                        element.append(_createAgElement(child));
                        element.appendChild(getWhitespaceNode());
                    }
                }
            }
        }
    }
    return element as T;
}
