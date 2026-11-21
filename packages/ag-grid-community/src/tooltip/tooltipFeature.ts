import type { AgTooltipFeature, TooltipCtrl, TooltipDetails } from 'ag-stack';

import type { BeanCollection } from '../context/context';
import type { ColDef, ColGroupDef } from '../entities/colDef';
import type { AgEventTypeParams } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import type { AgGridCommon } from '../interfaces/iCommon';
import type { ITooltipParams, TooltipCallbackParams, TooltipLocation } from './tooltipComponent';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type TooltipSourceParams = Pick<
    TooltipCallbackParams,
    'column' | 'colDef' | 'rowIndex' | 'node' | 'data' | 'value' | 'valueFormatted'
>;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface ResolvedTooltip extends TooltipDetails<TooltipLocation> {
    params?: TooltipSourceParams;
    sourceValues?: Pick<TooltipSourceParams, 'value' | 'valueFormatted'>;
    componentDefinition?: ColDef | ColGroupDef;
    shouldDisplay?: () => boolean;
    automatic?: boolean;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface TooltipSource extends TooltipCtrl<TooltipLocation, ResolvedTooltip> {}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _resolveTextTooltip(gos: GridOptionsService, tooltip: ResolvedTooltip): ResolvedTooltip {
    const whenTruncated = _isShowTooltipWhenTruncated(gos);
    if (tooltip.automatic) {
        tooltip.value = whenTruncated ? (tooltip.params?.valueFormatted ?? tooltip.params?.value) : undefined;
        tooltip.componentDefinition = undefined;
    }
    const value = tooltip.value;
    const { value: rawValue, valueFormatted } = tooltip.params ?? {};
    const isText = typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
    const repeatsText =
        isText &&
        ((rawValue != null && String(value) === String(rawValue)) ||
            (valueFormatted != null && String(value) === valueFormatted));
    tooltip.requiresTruncation = whenTruncated && !!(tooltip.automatic || repeatsText);
    return tooltip;
}

export function shouldDisplayTextTooltip(tooltip: ResolvedTooltip, getElement: () => HTMLElement | undefined): boolean {
    if (tooltip.shouldDisplay) {
        return tooltip.shouldDisplay();
    }
    if (!tooltip.requiresTruncation) {
        return true;
    }
    const element = getElement();
    return !!element && (element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getCellTooltipComponentDefinition(colDef: ColDef | undefined): ColDef | undefined {
    return colDef?.tooltip === false ? undefined : colDef;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getHeaderTooltipComponentDefinition(
    colDef: ColDef | ColGroupDef | null | undefined
): ColDef | ColGroupDef | undefined {
    return !colDef || colDef.headerTooltip === false ? undefined : colDef;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isShowTooltipWhenTruncated(gos: GridOptionsService): boolean {
    return gos.get('tooltipShowMode') === 'whenTruncated';
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type TooltipFeature = AgTooltipFeature<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    ITooltipParams,
    ResolvedTooltip,
    TooltipLocation
>;
