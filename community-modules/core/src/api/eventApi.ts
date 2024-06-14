import type { BeanCollection } from '../context/context';
import type { AgPublicEventType } from '../eventTypes';
import type { AgEventListener, AgGlobalEventListener } from '../events';

export function addEventListener<T extends AgPublicEventType>(
    beans: BeanCollection,
    eventType: T,
    listener: AgEventListener<T, any, any>
): void {
    beans.apiEventService.addEventListener(eventType, listener);
}
export function removeEventListener<T extends AgPublicEventType>(
    beans: BeanCollection,
    eventType: T,
    listener: AgEventListener<T, any, any>
): void {
    beans.apiEventService.removeEventListener(eventType, listener as AgEventListener);
}

export function addGlobalListener<T extends AgPublicEventType>(
    beans: BeanCollection,
    listener: AgGlobalEventListener<T, any, any>
): void {
    beans.apiEventService.addGlobalListener(listener);
}

export function removeGlobalListener<T extends AgPublicEventType>(
    beans: BeanCollection,
    listener: AgGlobalEventListener<T, any, any>
): void {
    beans.apiEventService.removeGlobalListener(listener);
}
