import { AgPositionableFeature } from 'ag-stack';

import type { BeanCollection } from '../../context/context';
import type { AgEventTypeParams } from '../../events';
import type { GridOptionsWithDefaults } from '../../gridOptionsDefault';
import type { GridOptionsService } from '../../gridOptionsService';
import type { AgGridCommon } from '../../interfaces/iCommon';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class PositionableFeature extends AgPositionableFeature<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService
> {}
