import { AgTooltipFeature } from 'ag-stack';

import type { BeanCollection } from '../context/context';
import type { AgEventTypeParams } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import type { AgGridCommon } from '../interfaces/iCommon';
import type { ITooltipParams, TooltipLocation } from './tooltipComponent';
import type { ResolvedTooltip } from './tooltipFeature';

export class GridTooltipFeature extends AgTooltipFeature<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    ITooltipParams,
    ResolvedTooltip,
    TooltipLocation
> {
    /** Built-in control tooltips belong to `TooltipModule`, not to the core that other features depend on. */
    protected override areBuiltInTooltipsSuppressed(): boolean {
        return !this.beans.tooltipSvc || super.areBuiltInTooltipsSuppressed();
    }
}
