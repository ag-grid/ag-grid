// ARIA HELPER FUNCTIONS
export function _toggleAriaAttribute(element: Element, attribute: string, value?: number | boolean | string | null) {
    if (value == null || (typeof value === 'string' && value == '')) {
        _removeAriaAttribute(element, attribute);
    } else {
        _setAriaAttribute(element, attribute, value);
    }
}

export function _setAriaAttribute(element: Element, attribute: string, value: number | boolean | string): void {
    element.setAttribute(_ariaAttributeName(attribute), value.toString());
}

export function _removeAriaAttribute(element: Element, attribute: string): void {
    element.removeAttribute(_ariaAttributeName(attribute));
}

function _ariaAttributeName(attribute: string) {
    return `aria-${attribute}`;
}

export function _setAriaRole(element: Element, role?: string | null) {
    if (role) {
        element.setAttribute('role', role);
    } else {
        element.removeAttribute('role');
    }
}

// ARIA ATTRIBUTE GETTERS
export function _getAriaLabel(element: Element): string | null {
    return element.getAttribute('aria-label');
}

// ARIA ATTRIBUTE SETTERS
export function _setAriaLabel(element: Element, label?: string | null): void {
    _toggleAriaAttribute(element, 'label', label);
}

export function _setAriaLabelledBy(element: Element, labelledBy?: string): void {
    _toggleAriaAttribute(element, 'labelledby', labelledBy);
}

export function _setAriaHidden(element: Element, hidden: boolean): void {
    _toggleAriaAttribute(element, 'hidden', hidden);
}
