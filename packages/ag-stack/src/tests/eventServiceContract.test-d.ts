import { describe, expectTypeOf, it } from 'vitest';

import type { AgEvent } from '../interfaces/agEvent';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { AgInternalEventService, AgRawEvents, ICommonSource } from '../interfaces/iDomFreeEvent';
import type { AgEventService } from '../interfaces/iEvent';
import type { IPropertiesService } from '../interfaces/iProperties';

interface Common {
    api: object;
    context: unknown;
}

interface Events extends BaseEvents {
    somethingHappened: AgEvent<'somethingHappened'> & Common & { widgetId: string };
}

// Members may move to a base interface, but must not change shape: grid compiles against these.
describe('the types ag-grid consumes', () => {
    it('keeps AgEventService dispatching the common-stripped event', () => {
        type Dispatch = Parameters<AgEventService<Events, Common>['dispatchEvent']>[0];

        expectTypeOf<Dispatch>().toEqualTypeOf<AgRawEvents<Events, Common> | BaseEvents[keyof BaseEvents]>();
        expectTypeOf<AgEventService<Events, Common>['beanName']>().toEqualTypeOf<'eventSvc'>();
        expectTypeOf<AgEventService<Events, Common>['eventServiceType']>().toEqualTypeOf<'global'>();
    });

    it('keeps the common fields off properties entirely', () => {
        expectTypeOf<IPropertiesService<{}>>().not.toHaveProperty('addCommon');
        expectTypeOf<ICommonSource<Common>>().toHaveProperty('addCommon');
    });
});

describe('the internal view', () => {
    it('dispatches a whole event, common fields included', () => {
        expectTypeOf<Parameters<AgInternalEventService<Events>['dispatchEvent']>[0]>().toEqualTypeOf<
            Events[keyof Events]
        >();
    });

    it('is satisfied by the decorating service, so one bean can serve both', () => {
        expectTypeOf<AgEventService<Events, Common>>().toExtend<
            AgInternalEventService<Events, AgRawEvents<Events, Common> | BaseEvents[keyof BaseEvents]>
        >();
    });
});
