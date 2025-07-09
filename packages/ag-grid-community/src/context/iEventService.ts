import type { AgEventService } from '../agStack/interfaces/iEvent';
import type { AgEventType } from '../eventTypes';
import type { AgEventTypeParams, AllEventsWithoutGridCommon } from '../events';

export type IEventService = AgEventService<AgEventType, AgEventTypeParams, AllEventsWithoutGridCommon>;
