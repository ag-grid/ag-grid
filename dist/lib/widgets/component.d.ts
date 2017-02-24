// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Context } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { IComponent } from "../interfaces/iComponent";
export declare class Component extends BeanStub implements IComponent<any> {
    static EVENT_VISIBLE_CHANGED: string;
    private eGui;
    private childComponents;
    private annotatedEventListeners;
    private visible;
    constructor(template?: string);
    instantiate(context: Context): void;
    private instantiateRecurse(parentNode, context);
    private swapComponentForNode(newComponent, parentNode, childNode);
    private swapInComponentForQuerySelectors(newComponent, childNode);
    setTemplate(template: string): void;
    attributesSet(): void;
    private wireQuerySelectors();
    private addAnnotatedEventListeners();
    private removeAnnotatedEventListeners();
    getGui(): HTMLElement;
    protected setGui(eGui: HTMLElement): void;
    protected queryForHtmlElement(cssSelector: string): HTMLElement;
    protected queryForHtmlInputElement(cssSelector: string): HTMLInputElement;
    appendChild(newChild: Node | IComponent<any>): void;
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
