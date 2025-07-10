import type { AgEventService } from '../agStack/interfaces/iEvent';
import type { AgEventTypeParams, AllEventsWithoutGridCommon } from '../events';

export type IEventService = AgEventService<AgEventTypeParams, AllEventsWithoutGridCommon>;
