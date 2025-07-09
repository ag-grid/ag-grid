export function _setAriaAttribute(element: Element, attribute: string, value: number | boolean | string): void {
    element.setAttribute(_ariaAttributeName(attribute), value.toString());
}

export function _removeAriaAttribute(element: Element, attribute: string): void {
    element.removeAttribute(_ariaAttributeName(attribute));
}

// ARIA HELPER FUNCTIONS
export function _toggleAriaAttribute(element: Element, attribute: string, value?: number | boolean | string | null) {
    if (value == null || (typeof value === 'string' && value == '')) {
        _removeAriaAttribute(element, attribute);
    } else {
        _setAriaAttribute(element, attribute, value);
    }
}

export function _setAriaHidden(element: Element, hidden: boolean): void {
    _toggleAriaAttribute(element, 'hidden', hidden);
}

function _ariaAttributeName(attribute: string) {
    return `aria-${attribute}`;
}
