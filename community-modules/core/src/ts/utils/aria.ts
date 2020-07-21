function setAriaAttribute(element: HTMLElement, attribute: string, value: number | boolean | string): void {
    element.setAttribute(`aria-${attribute}`, value.toString());
}

export function getAriaLevel(element: HTMLElement): number {
    return parseInt(element.getAttribute('aria-level'), 10);
}

export function getAriaPosInSet(element: HTMLElement): number {
    return parseInt(element.getAttribute('aria-posinset'), 10);
}

export function setAriaLabel(element: HTMLElement, label: string): void {
    setAriaAttribute(element, 'label', label);
}

export function setAriaLabelledBy(element: HTMLElement, labelledBy: string): void {
    setAriaAttribute(element, 'labelledby', labelledBy);
}

export function setAriaLevel(element: HTMLElement, level: number): void {
    setAriaAttribute(element, 'level', level);
}

export function setAriaDisabled(element: HTMLElement, disabled: boolean): void {
    setAriaAttribute(element, 'disabled', disabled);
}

export function setAriaExpanded(element: HTMLElement, expanded: boolean): void {
    setAriaAttribute(element, 'expanded', expanded);
}

export function setAriaSetSize(element: HTMLElement, setsize: number): void {
    setAriaAttribute(element, 'setsize', setsize);
}

export function setAriaPosInSet(element: HTMLElement, position: number): void {
    setAriaAttribute(element, 'posinset', position);
}

export function setAriaMultiSelectable(element: HTMLElement, multiselectable: boolean): void {
    setAriaAttribute(element, 'multiselectable', multiselectable);
}

export function setAriaRowCount(element: HTMLElement, rowCount: number): void {
    setAriaAttribute(element, 'rowcount', rowCount);
}

export function setAriaRowIndex(element: HTMLElement, rowCount: number): void {
    setAriaAttribute(element, 'rowindex', rowCount);
}

export function setAriaColCount(element: HTMLElement, colCount: number): void {
    setAriaAttribute(element, 'colcount', colCount);
}

export function setAriaColIndex(element: HTMLElement, colIndex: number): void {
    setAriaAttribute(element, 'colindex', colIndex);
}

export function setAriaColSpan(element: HTMLElement, span: number): void {
    setAriaAttribute(element, 'colspan', span);
}

export function setAriaSort(element: HTMLElement, sort: 'ascending' | 'descending' | 'none'): void {
    setAriaAttribute(element, 'sort', sort);
}

export function setAriaSelected(element: HTMLElement, selected: boolean): void {
    setAriaAttribute(element, 'selected', selected);
}