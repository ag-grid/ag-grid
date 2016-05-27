// Type definitions for ag-grid v4.2.5
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { IEventEmitter } from "../interfaces/iEventEmitter";
export declare class Component implements IEventEmitter {
    private eGui;
    private destroyFunctions;
    private localEventService;
    private childComponents;
    constructor(template?: string);
    setTemplate(template: string): void;
    addEventListener(eventType: string, listener: Function): void;
    removeEventListener(eventType: string, listener: Function): void;
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
}
