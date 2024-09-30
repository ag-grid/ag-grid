import type { BeanCollection } from '../../context/context';
import type { AgPublicEventType } from '../../eventTypes';
import type { AgEventListener, AgGlobalEventListener } from '../../events';

export function addEventListener<TEventType extends AgPublicEventType>(
    beans: BeanCollection,
    eventType: TEventType,
    listener: AgEventListener<any, any, TEventType>
): void {
    beans.apiEventService?.addEventListener(eventType, listener);
}
export function removeEventListener<TEventType extends AgPublicEventType>(
    beans: BeanCollection,
    eventType: TEventType,
    listener: AgEventListener<any, any, TEventType>
): void {
    beans.apiEventService?.removeEventListener(eventType, listener as AgEventListener);
}

export function addGlobalListener<TEventType extends AgPublicEventType>(
    beans: BeanCollection,
    listener: AgGlobalEventListener<any, any, TEventType>
): void {
    beans.apiEventService?.addGlobalListener(listener);
}

export function removeGlobalListener<TEventType extends AgPublicEventType>(
    beans: BeanCollection,
    listener: AgGlobalEventListener<any, any, TEventType>
): void {
    beans.apiEventService?.removeGlobalListener(listener);
}
