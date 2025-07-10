import type { AgBeanStubEvent } from '../agBeanStub';
import type { AgEvent } from './agEvent';
import type { AgBaseBean, AgBean } from './iBean';
import type { IEventListener } from './iEventEmitter';
import type { BaseProperties } from './iProperties';

export interface AgBaseComponent<TBeanCollection> extends AgBaseBean<TBeanCollection> {
    getGui(): HTMLElement;
}

export interface AgComponent<
    TBeanCollection,
    TLocalEventListener extends IEventListener<TLocalEventType>,
    TLocalEventType extends string,
    TGlobalEvents,
    TProperties extends BaseProperties,
> extends AgBaseComponent<TBeanCollection>,
        AgBean<TBeanCollection, TLocalEventListener, TLocalEventType, TGlobalEvents, TProperties> {
    getCompId(): number;

    getFocusableElement(): HTMLElement;

    getAriaElement(): Element;

    setParentComponent(
        component: AgComponent<TBeanCollection, TLocalEventListener, any, TGlobalEvents, TProperties>
    ): void;

    getParentComponent<T extends AgComponent<TBeanCollection, TLocalEventListener, any, TGlobalEvents, TProperties>>():
        | T
        | undefined;

    prependChild(newChild: HTMLElement | AgBaseComponent<TBeanCollection>, container?: HTMLElement): void;

    appendChild(newChild: HTMLElement | AgBaseComponent<TBeanCollection>, container?: HTMLElement): void;

    isDisplayed(): boolean;

    setVisible(visible: boolean, options?: { skipAriaHidden?: boolean }): void;

    setDisplayed(displayed: boolean, options?: { skipAriaHidden?: boolean }): void;

    addGuiEventListener(event: string, listener: (event: any) => void, options?: AddEventListenerOptions): void;

    addCss(className: string): void;

    removeCss(className: string): void;

    toggleCss(className: string, addOrRemove: boolean): void;
}

/** The RefPlaceholder is used to control when data-ref attribute should be applied to the component
 * There are hanging data-refs in the DOM that are not being used internally by the component which we don't want to apply to the component.
 * There is also the case where data-refs are solely used for passing parameters to the component and should not be applied to the component.
 * It also enables validation to catch typo errors in the data-ref attribute vs component name.
 * The value is `null` so that it can be identified in the component and distinguished from just missing with undefined.
 * The `null` value also allows for existing falsy checks to work as expected when code can be run before the template is setup.
 */

export const RefPlaceholder: any = null;

export type AgComponentEvent = 'displayChanged' | AgBeanStubEvent;
export interface VisibleChangedEvent extends AgEvent<'displayChanged'> {
    visible: boolean;
}

export type AgComponentSelector<TComponentSelectorType extends string, TBeanCollection = any> = {
    component: { new (params?: any): AgBaseComponent<TBeanCollection> };
    selector: TComponentSelectorType;
};
