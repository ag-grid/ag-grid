import type { AgBean } from './agBean';
import type { BaseEvents } from './baseEvents';
import type { BaseProperties } from './baseProperties';
import type { AgEventHandlers } from './iContext';

/** Adds the element-listener API to `AgBean`. */
export interface AgUiBean<
    TBeanCollection,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TLocalEventType extends string,
> extends AgBean<TBeanCollection, TProperties, TGlobalEvents, TLocalEventType> {
    addManagedElementListeners<TEvent extends keyof HTMLElementEventMap>(
        object: Element | Document | ShadowRoot,
        handlers: AgEventHandlers<TEvent, HTMLElementEventMap[TEvent]>
    ): (() => null)[];
}
