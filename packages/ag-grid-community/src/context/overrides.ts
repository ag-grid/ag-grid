import type { AgEventType } from '../eventTypes';
import type { AgEventTypeParams, AllEventsWithoutGridCommon } from '../events';
import type { AgEventService } from './newContext/iEvent';

export type IEventService = AgEventService<AgEventType, AgEventTypeParams, AllEventsWithoutGridCommon>;
