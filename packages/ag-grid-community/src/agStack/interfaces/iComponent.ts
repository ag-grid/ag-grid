import type { AgBaseBean, AgBean } from './iBean';
import type { AgBaseContext } from './iContext';
import type { IEventListener } from './iEventEmitter';
import type { BaseProperties } from './iProperties';

export interface AgBaseComponent<TBeanCollection> extends AgBaseBean<TBeanCollection> {
    getGui(): HTMLElement;
}

export interface AgComponent<
    TComponent extends AgComponent<
        TComponent,
        TBeanName,
        TBeanCollection,
        TBean,
        TContext,
        TLocalEventListener,
        TLocalEventType,
        TGlobalEventType,
        TGlobalEventParams,
        TProperties,
        TBooleanProperties,
        TPropertiesEventSource,
        TPropertiesEventType
    >,
    TBeanName extends string,
    TBeanCollection,
    TBean extends AgBaseBean<TBeanCollection>,
    TContext extends AgBaseContext<TBeanName, TBeanCollection>,
    TLocalEventListener extends IEventListener<TLocalEventType>,
    TLocalEventType extends string,
    TGlobalEventType extends string,
    TGlobalEventParams extends Record<TGlobalEventType, any>,
    TProperties extends BaseProperties,
    TBooleanProperties,
    TPropertiesEventSource,
    TPropertiesEventType extends string,
> extends AgBaseComponent<TBeanCollection>,
        AgBean<
            TBeanName,
            TBeanCollection,
            TBean,
            TContext,
            TLocalEventListener,
            TLocalEventType,
            TGlobalEventType,
            TGlobalEventParams,
            TProperties,
            TBooleanProperties,
            TPropertiesEventSource,
            TPropertiesEventType
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
