// Type definitions for ag-grid v4.0.5
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { EventService } from "../eventService";
export declare class Component {
    private eGui;
    private destroyFunctions;
    private localEventService;
    constructor(template: string);
    addEventListener(eventType: string, listener: Function): void;
    dispatchEvent(eventType: string, event?: any): void;
    getGui(): HTMLElement;
    protected queryForHtmlElement(cssSelector: string): HTMLElement;
    protected queryForHtmlInputElement(cssSelector: string): HTMLInputElement;
    appendChild(newChild: Node | Component): void;
    setVisible(visible: boolean): void;
    destroy(): void;
    addGuiEventListener(event: string, listener: () => void): void;
    addDestroyableEventListener(eElement: HTMLElement | EventService, event: string, listener: () => void): void;
    addDestroyFunc(func: () => void): void;
}
