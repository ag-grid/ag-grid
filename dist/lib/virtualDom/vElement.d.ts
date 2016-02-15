// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
export default class VElement {
    static idSequence: number;
    private id;
    private elementAttachedListeners;
    constructor();
    getId(): number;
    addElementAttachedListener(listener: (element: Element) => void): void;
    protected fireElementAttached(element: Element): void;
    elementAttached(element: Element): void;
    toHtmlString(): string;
}
