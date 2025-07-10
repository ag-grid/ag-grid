import type { AgBaseBean, AgBean } from './iBean';
import type { IEventListener } from './iEventEmitter';
import type { BaseProperties } from './iProperties';

export interface AgBaseComponent<TBeanCollection> extends AgBaseBean<TBeanCollection> {
    getGui(): HTMLElement;
}

export interface AgComponent<
    TComponent extends AgComponent<
        TComponent,
        TBeanCollection,
        TBean,
        TLocalEventListener,
        TLocalEventType,
        TGlobalEvents,
        TProperties,
        TBooleanProperties
    >,
    TBeanCollection,
    TBean extends AgBaseBean<TBeanCollection>,
    TLocalEventListener extends IEventListener<TLocalEventType>,
    TLocalEventType extends string,
    TGlobalEvents,
    TProperties extends BaseProperties,
    TBooleanProperties,
> extends AgBaseComponent<TBeanCollection>,
        AgBean<
            TBeanCollection,
            TBean,
            TLocalEventListener,
            TLocalEventType,
            TGlobalEvents,
            TProperties,
            TBooleanProperties
        > {
    getCompId(): number;

    getFocusableElement(): HTMLElement;

    getAriaElement(): Element;

    setParentComponent(component: TComponent): void;

    getParentComponent<T extends TComponent>(): T | undefined;

    prependChild(newChild: HTMLElement | TComponent, container?: HTMLElement): void;

    appendChild(newChild: HTMLElement | TComponent, container?: HTMLElement): void;

    isDisplayed(): boolean;

    setVisible(visible: boolean, options?: { skipAriaHidden?: boolean }): void;

    setDisplayed(displayed: boolean, options?: { skipAriaHidden?: boolean }): void;

    addGuiEventListener(event: string, listener: (event: any) => void, options?: AddEventListenerOptions): void;

    addCss(className: string): void;

    removeCss(className: string): void;

    toggleCss(className: string, addOrRemove: boolean): void;
}
