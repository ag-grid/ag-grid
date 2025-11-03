import { AgPositionableFeature } from '../../agStack/rendering/agPositionableFeature';
import type { BeanCollection } from '../../context/context';
import type { AgEventTypeParams } from '../../events';
import type { GridOptionsWithDefaults } from '../../gridOptionsDefault';
import type { GridOptionsService } from '../../gridOptionsService';
import type { AgGridCommon } from '../../interfaces/iCommon';

export class PositionableFeature extends AgPositionableFeature<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService
> {}
