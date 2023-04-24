import { AgEvent } from "../events";
import { AgStackComponentsRegistry } from "../components/agStackComponentsRegistry";
import { BeanStub } from "../context/beanStub";
import { ITooltipParams } from "../rendering/tooltipComponent";
import { WithoutGridCommon } from "../interfaces/iCommon";
export interface VisibleChangedEvent extends AgEvent {
    visible: boolean;
}
export declare class Component extends BeanStub {
    static elementGettingCreated: any;
    static EVENT_DISPLAYED_CHANGED: string;
    private eGui;
    protected readonly agStackComponentsRegistry: AgStackComponentsRegistry;
    private displayed;
    private visible;
    protected parentComponent: Component | undefined;
    private compId;
    private cssClassManager;
    protected usingBrowserTooltips: boolean;
    private tooltipText;
    private tooltipFeature;
    constructor(template?: string);
    private preConstructOnComponent;
    getCompId(): number;
    getTooltipParams(): WithoutGridCommon<ITooltipParams>;
    setTooltip(newTooltipText?: string | null): void;
    private createChildComponentsFromTags;
    private createComponentFromElement;
    private copyAttributesFromNode;
    private swapComponentForNode;
    private swapInComponentForQuerySelectors;
    private iterateOverQuerySelectors;
    setTemplate(template: string | null | undefined, paramsMap?: {
        [key: string]: any;
    }): void;
    setTemplateFromElement(element: HTMLElement, paramsMap?: {
        [key: string]: any;
    }): void;
    private createChildComponentsPreConstruct;
    protected wireQuerySelectors(): void;
    getGui(): HTMLElement;
    getFocusableElement(): HTMLElement;
    setParentComponent(component: Component): void;
    getParentComponent(): Component | undefined;
    protected setGui(eGui: HTMLElement): void;
    protected queryForHtmlElement(cssSelector: string): HTMLElement;
    protected queryForHtmlInputElement(cssSelector: string): HTMLInputElement;
    appendChild(newChild: HTMLElement | Component, container?: HTMLElement): void;
    isDisplayed(): boolean;
    setVisible(visible: boolean, options?: {
        skipAriaHidden?: boolean;
    }): void;
    setDisplayed(displayed: boolean, options?: {
        skipAriaHidden?: boolean;
    }): void;
    protected destroy(): void;
    addGuiEventListener(event: string, listener: (event: any) => void, options?: AddEventListenerOptions): void;
    addCssClass(className: string): void;
    removeCssClass(className: string): void;
    containsCssClass(className: string): boolean;
    addOrRemoveCssClass(className: string, addOrRemove: boolean): void;
    getAttribute(key: string): string | null;
    getRefElement(refName: string): HTMLElement;
}
