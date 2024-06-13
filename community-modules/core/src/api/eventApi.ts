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
