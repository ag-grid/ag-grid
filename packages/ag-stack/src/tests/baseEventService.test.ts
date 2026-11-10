import { describe, expect, it } from 'vitest';

import { BaseEventService } from '../events/baseEventService';
import type { AgEvent } from '../interfaces/agEvent';
import type { BaseEvents } from '../interfaces/baseEvents';

interface Common {
    api: object;
    context: unknown;
}

interface Events extends BaseEvents {
    somethingHappened: AgEvent<'somethingHappened'> & Common & { widgetId: string };
    layoutSettled: AgEvent<'layoutSettled'>;
}

const api = { marker: 'the-api' };
const appContext = { marker: 'the-context' };

const gos = {
    beanName: 'gos' as const,
    addCommon: <T>(params: object): T => ({ ...params, api, context: appContext }) as T,
};

const wire = <T extends { preWireBeans(beans: any): void }>(service: T): T => {
    service.preWireBeans({ gos, eventSvc: service, context: undefined });
    return service;
};

const received = (
    service: { addListener(t: any, l: any, a?: boolean): void },
    eventType: keyof Events = 'somethingHappened'
): object[] => {
    const events: object[] = [];
    service.addListener(eventType, (event: object) => events.push(event));
    return events;
};

class PublicOnlyEventService extends BaseEventService<any, any, Events, Common, any> {
    protected override readonly commonEventTypes = new Set<keyof Events & string>(['somethingHappened']);
}

describe('BaseEventService', () => {
    it('adds the common fields on the way out', () => {
        const service = wire(new BaseEventService<any, any, Events, Common, any>());
        const events = received(service);

        service.dispatchEvent({ type: 'somethingHappened', widgetId: 'w1' });

        expect(events).toEqual([{ type: 'somethingHappened', widgetId: 'w1', api, context: appContext }]);
    });

    it('adds them only to the event types it names, when it names any', () => {
        const service = wire(new PublicOnlyEventService());
        const named = received(service);
        const unnamed = received(service, 'layoutSettled');

        service.dispatchEvent({ type: 'somethingHappened', widgetId: 'w1' });
        service.dispatchEvent({ type: 'layoutSettled' });

        expect(named).toEqual([{ type: 'somethingHappened', widgetId: 'w1', api, context: appContext }]);
        expect(unnamed).toEqual([{ type: 'layoutSettled' }]);
    });
});
