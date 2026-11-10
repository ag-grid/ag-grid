import { describe, expectTypeOf, it } from 'vitest';

import type { AgEvent } from '../interfaces/agEvent';
import type { AgEventService, AgRawEvents, ICommonSource } from '../interfaces/iEvent';
import type { IPropertiesService } from '../interfaces/iProperties';

interface Common {
    api: object;
    context: unknown;
}

interface Events {
    somethingHappened: AgEvent<'somethingHappened'> & Common & { widgetId: string };
}

// Members may move, but must not change shape: grid and Studio compile against these.
describe('AgEventService', () => {
    it('dispatches a whole event by default', () => {
        expectTypeOf<Parameters<AgEventService<Events>['dispatchEvent']>[0]>().toEqualTypeOf<Events[keyof Events]>();
        expectTypeOf<AgEventService<Events>['beanName']>().toEqualTypeOf<'eventSvc'>();
        expectTypeOf<AgEventService<Events>['eventServiceType']>().toEqualTypeOf<'global'>();
    });

    it('dispatches the common-stripped event for a host that adds common fields', () => {
        type Dispatch = Parameters<AgEventService<Events, AgRawEvents<Events, Common>>['dispatchEvent']>[0];

        expectTypeOf<Dispatch>().toEqualTypeOf<AgRawEvents<Events, Common>>();
    });

    it('keeps the common fields off properties entirely', () => {
        expectTypeOf<IPropertiesService<{}>>().not.toHaveProperty('addCommon');
        expectTypeOf<ICommonSource<Common>>().toHaveProperty('addCommon');
    });
});
