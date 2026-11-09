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

const received = (service: { addListener(t: any, l: any, a?: boolean): void }): object[] => {
    const events: object[] = [];
    service.addListener('somethingHappened', (event: object) => events.push(event));
    return events;
};

describe('BaseEventService', () => {
    it('adds the common fields on the way out', () => {
        const service = wire(new BaseEventService<any, any, Events, Common, any>());
        const events = received(service);

        service.dispatchEvent({ type: 'somethingHappened', widgetId: 'w1' });

        expect(events).toEqual([{ type: 'somethingHappened', widgetId: 'w1', api, context: appContext }]);
    });
});
