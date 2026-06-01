import type { AgEventService } from 'ag-stack';

import type { AgEventTypeParams } from '../events';
import type { AgGridCommon } from './iCommon';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type IEventService = AgEventService<AgEventTypeParams, AgGridCommon<any, any>>;
