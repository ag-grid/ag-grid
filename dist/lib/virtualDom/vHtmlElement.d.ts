// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import VElement from "./vElement";
export default class VHtmlElement extends VElement {
    private type;
    private classes;
    private eventListeners;
    private attributes;
    private children;
    private innerHtml;
    private style;
    private bound;
    private element;
    constructor(type: string);
    getElement(): HTMLElement;
    setInnerHtml(innerHtml: string): void;
    addStyles(styles: any): void;
    private attachEventListeners(node);
    addClass(newClass: string): void;
    removeClass(oldClass: string): void;
    addClasses(classes: string[]): void;
    toHtmlString(): string;
    private toHtmlStringChildren();
    private toHtmlStringAttributes();
    private toHtmlStringClasses();
    private toHtmlStringStyles();
    appendChild(child: any): void;
    setAttribute(key: string, value: string): void;
    addEventListener(event: string, listener: EventListener): void;
    elementAttached(element: Element): void;
    fireElementAttachedToChildren(element: Element): void;
}
