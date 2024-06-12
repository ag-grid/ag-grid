import type { BeanCollection } from '../context/context';
import type { AgPublicEventType } from '../eventTypes';
import type { AgGlobalEventListener, EventTypeParams, SomeEventsType } from '../events';

export type AgEventListener<TEventType extends keyof EventTypeParams<TData, TContext>, TData = any, TContext = any> = (
    event: (params: EventTypeParams<TData, TContext>[TEventType]) => void
) => void;

export function addEventListener<T extends SomeEventsType>(
    beans: BeanCollection,
    eventType: T,
    listener: AgEventListener<T, any, any>
): void {
    beans.apiEventService.addEventListener(eventType, listener as any);
}

export function addGlobalListener(beans: BeanCollection, listener: (...args: any[]) => any): void {
    addEventListener(beans, 'modelUpdated', (d) => console.log(d));

    beans.apiEventService.addGlobalListener(listener as AgGlobalEventListener);
}

export function removeEventListener(
    beans: BeanCollection,
    eventType: AgPublicEventType,
    listener: (...args: any[]) => any
): void {
    beans.apiEventService.removeEventListener(eventType, listener as AgEventListener);
}

export function removeGlobalListener(beans: BeanCollection, listener: (...args: any[]) => any): void {
    beans.apiEventService.removeGlobalListener(listener as AgGlobalEventListener);
}
