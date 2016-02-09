// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import VElement from "./vElement";
export default class VWrapperElement extends VElement {
    private wrappedElement;
    constructor(wrappedElement: Element);
    toHtmlString(): string;
    elementAttached(element: Element): void;
}
