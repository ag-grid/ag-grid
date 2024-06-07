import type { BeanCollection } from '../context/context';
import type { AgPublicEventType } from '../eventTypes';
import type { AgEventListener, AgGlobalEventListener } from '../events';

export function addEventListener(
    beans: BeanCollection,
    eventType: AgPublicEventType,
    listener: (...args: any[]) => any
): void {
    beans.apiEventService.addEventListener(eventType, listener as AgEventListener);
}

export function addGlobalListener(beans: BeanCollection, listener: (...args: any[]) => any): void {
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
