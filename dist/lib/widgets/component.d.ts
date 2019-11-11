import { Context } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { IComponent } from "../interfaces/iComponent";
import { AgEvent } from "../events";
export interface VisibleChangedEvent extends AgEvent {
    visible: boolean;
}
export declare class Component extends BeanStub {
    static EVENT_DISPLAYED_CHANGED: string;
    private eGui;
    private childComponents;
    private annotatedEventListeners;
    private displayed;
    private visible;
    protected parentComponent: Component | undefined;
    private compId;
    constructor(template?: string);
    getCompId(): number;
    private createChildComponentsFromTags;
    private copyAttributesFromNode;
    private swapComponentForNode;
    private swapInComponentForQuerySelectors;
    setTemplate(template: string): void;
    setTemplateFromElement(element: HTMLElement): void;
    private createChildComponentsPreConstruct;
    protected wireQuerySelectors(): void;
    private addAnnotatedEventListeners;
    private getAgComponentMetaData;
    private removeAnnotatedEventListeners;
    getGui(): HTMLElement;
    setParentComponent(component: Component): void;
    getParentComponent(): Component | undefined;
    protected setGui(eGui: HTMLElement): void;
    protected queryForHtmlElement(cssSelector: string): HTMLElement;
    protected queryForHtmlInputElement(cssSelector: string): HTMLInputElement;
    appendChild(newChild: Node | IComponent<any>): void;
    addFeature(feature: BeanStub, context?: Context): void;
    isDisplayed(): boolean;
    setVisible(visible: boolean): void;
    setDisplayed(displayed: boolean): void;
    addOrRemoveCssClass(className: string, addOrRemove: boolean): void;
    destroy(): void;
    addGuiEventListener(event: string, listener: (event: any) => void): void;
    addCssClass(className: string): void;
    removeCssClass(className: string): void;
    getAttribute(key: string): string | null;
    getRefElement(refName: string): HTMLElement;
}
