// Type definitions for ag-grid v5.0.0-alpha.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { IEventEmitter } from "../interfaces/iEventEmitter";
import { Context } from "../context/context";
export declare class Component implements IEventEmitter {
    private eGui;
    private destroyFunctions;
    private localEventService;
    private childComponents;
    private annotatedEventListeners;
    constructor(template?: string);
    instantiate(context: Context): void;
    private instantiateRecurse(parentNode, context);
    private swapComponentForNode(newComponent, parentNode, childNode);
    private swapInComponentForQuerySelectors(newComponent, childNode);
    setTemplate(template: string): void;
    private wireQuerySelectors();
    private addAnnotatedEventListeners();
    private removeAnnotatedEventListeners();
    addEventListener(eventType: string, listener: Function): void;
    removeEventListener(eventType: string, listener: Function): void;
    dispatchEventAsync(eventType: string, event?: any): void;
    dispatchEvent(eventType: string, event?: any): void;
    getGui(): HTMLElement;
    protected queryForHtmlElement(cssSelector: string): HTMLElement;
    protected queryForHtmlInputElement(cssSelector: string): HTMLInputElement;
    appendChild(newChild: Node | Component): void;
    setVisible(visible: boolean): void;
    destroy(): void;
    addGuiEventListener(event: string, listener: (event: any) => void): void;
    addDestroyableEventListener(eElement: HTMLElement | IEventEmitter, event: string, listener: (event?: any) => void): void;
    addDestroyFunc(func: () => void): void;
    addCssClass(className: string): void;
    getAttribute(key: string): string;
}
