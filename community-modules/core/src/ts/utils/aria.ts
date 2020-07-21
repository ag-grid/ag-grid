export function getAriaLevel(element: HTMLElement): number {
    return parseInt(element.getAttribute('aria-level'), 10);
}

export function setAriaLevel(element: HTMLElement, level: number): void {
    element.setAttribute('aria-level', level.toString());
}

export function setAriaDisabled(element: HTMLElement, disabled: boolean): void {
    element.setAttribute('aria-disabled', disabled.toString());
}

export function setAriaExpanded(element: HTMLElement, expanded: boolean): void {
    element.setAttribute('aria-expanded', expanded.toString());
}
