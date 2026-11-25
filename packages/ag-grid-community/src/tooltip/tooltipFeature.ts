import type { AgTooltipFeature, TooltipCtrl, TooltipDetails } from 'ag-stack';
import { _isHorizontalScrollShowing, _isVerticalScrollShowing } from 'ag-stack';

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
    showMode?: GridOptionsWithDefaults['tooltipShowMode'];
    matchesSource?: boolean;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface TooltipSource extends TooltipCtrl<TooltipLocation, ResolvedTooltip> {}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _resolveTextTooltip(gos: GridOptionsService, tooltip: ResolvedTooltip): ResolvedTooltip {
    const mode = gos.get('tooltipShowMode');
    tooltip.showMode = mode;
    if (tooltip.automatic) {
        tooltip.value = mode === 'auto' ? (tooltip.params?.valueFormatted ?? tooltip.params?.value) : undefined;
    }
    const value = tooltip.value;
    const sourceValue = tooltip.params?.valueFormatted ?? tooltip.params?.value;
    const isText = typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
    tooltip.matchesSource = isText && sourceValue != null && String(value) === String(sourceValue);
    tooltip.requiresTruncation =
        mode === 'whenTruncated' || (mode === 'auto' && !!(tooltip.automatic || tooltip.matchesSource));
    return tooltip;
}

export function shouldDisplayTextTooltip(tooltip: ResolvedTooltip, getElement: () => HTMLElement | undefined): boolean {
    if (tooltip.shouldDisplay) {
        return tooltip.shouldDisplay();
    }
    if (tooltip.showMode === 'whenDifferent') {
        return !tooltip.matchesSource;
    }
    if (!tooltip.requiresTruncation) {
        return true;
    }
    const element = getElement();
    if (!element) {
        // Preserve whenTruncated's custom-renderer fallback when the grid cannot measure its text.
        return tooltip.showMode === 'whenTruncated';
    }
    return _isHorizontalScrollShowing(element) || _isVerticalScrollShowing(element);
}

export function getGroupTooltipTextElement(element: HTMLElement | undefined, scope = ''): HTMLElement | undefined {
    return (
        element?.querySelector<HTMLElement>(
            `${scope}.ag-cell-wrapper.ag-group-default-inner-renderer > .ag-group-value`
        ) ?? undefined
    );
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
export function _isAutomaticTooltipEnabled(gos: GridOptionsService): boolean {
    return gos.get('tooltipShowMode') === 'auto';
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
