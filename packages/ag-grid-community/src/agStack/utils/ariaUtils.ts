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

export function _setAriaExpanded(element: Element, expanded: boolean): void {
    _setAriaAttribute(element, 'expanded', expanded);
}

export function _setAriaSetSize(element: Element, setsize: number): void {
    _setAriaAttribute(element, 'setsize', setsize);
}

export function _setAriaPosInSet(element: Element, position: number): void {
    _setAriaAttribute(element, 'posinset', position);
}

export function _setAriaSelected(element: Element, selected?: boolean): void {
    _toggleAriaAttribute(element, 'selected', selected);
}

export function _setAriaControls(controllerElement: Element, controlledId?: string | null) {
    _toggleAriaAttribute(controllerElement, 'controls', controlledId);
}

export function _setAriaControlsAndLabel(controllerElement: Element, controlledElement: Element) {
    _setAriaControls(controllerElement, controlledElement.id);
    _setAriaLabelledBy(controlledElement, controllerElement.id);
}
