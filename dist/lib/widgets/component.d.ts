// Type definitions for ag-grid v13.3.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Context } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { IAfterGuiAttachedParams, IComponent } from "../interfaces/iComponent";
import { AgEvent } from "../events";
export interface VisibleChangedEvent extends AgEvent {
    visible: boolean;
}
export declare class Component extends BeanStub implements IComponent<any, IAfterGuiAttachedParams> {
    static EVENT_VISIBLE_CHANGED: string;
    private template;
    private eHtmlElement;
    private childComponents;
    private hydrated;
    private annotatedEventListeners;
    private visible;
    private compId;
    constructor(template?: string);
    setTemplateNoHydrate(template: string): void;
    afterGuiAttached(params: IAfterGuiAttachedParams): void;
    getCompId(): number;
    instantiate(context: Context): void;
    private instantiateRecurse(parentNode, context);
    private swapComponentForNode(newComponent, parentNode, childNode);
    private swapInComponentForQuerySelectors(newComponent, childNode);
    setTemplate(template: string): void;
    setHtmlElement(element: HTMLElement): void;
    private hydrate();
    attributesSet(): void;
    private wireQuerySelectors();
    private addAnnotatedEventListeners();
    private removeAnnotatedEventListeners();
    getGui(): HTMLElement | string;
    getHtmlElement(): HTMLElement;
    protected setHtmlElementNoHydrate(eHtmlElement: HTMLElement): void;
    protected queryForHtmlElement(cssSelector: string): HTMLElement;
    protected queryForHtmlInputElement(cssSelector: string): HTMLInputElement;
    appendChild(newChild: Node | IComponent<any, IAfterGuiAttachedParams>): void;
    addFeature(context: Context, feature: BeanStub): void;
    isVisible(): boolean;
    setVisible(visible: boolean): void;
    addOrRemoveCssClass(className: string, addOrRemove: boolean): void;
    destroy(): void;
    addGuiEventListener(event: string, listener: (event: any) => void): void;
    addCssClass(className: string): void;
    removeCssClass(className: string): void;
    getAttribute(key: string): string;
    getRefElement(refName: string): HTMLElement;
}
