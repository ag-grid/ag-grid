import { _exists, _getValueUsingDotField } from 'ag-stack';

import type { AgColumn } from '../entities/agColumn';
import type { AbstractColDef, ColDef } from '../entities/colDef';
import type { GridOptionsService } from '../gridOptionsService';
import type { HeaderTooltipCallbackParams, TooltipCallbackParams } from './tooltipComponent';
import type { ResolvedTooltip } from './tooltipFeature';
import { _getHeaderTooltipComponentDefinition, _resolveTextTooltip } from './tooltipFeature';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type LegacyTooltipFieldResolution =
    | { resolved: false }
    | {
          resolved: true;
          value: any;
      };

function _evaluateTooltipDefinition<TParams extends { value?: any; valueFormatted?: string | null }>(
    definition: boolean | string | ((params: TParams) => any) | null | undefined,
    params: TParams
): any {
    if (definition === true) {
        return params.valueFormatted ?? params.value;
    }
    if (definition === false || definition == null) {
        return undefined;
    }
    return typeof definition === 'function' ? definition(params) : definition;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _resolveCellTooltipValue<TData, TValue, TContext>(
    colDef: ColDef<TData, TValue>,
    params: TooltipCallbackParams<TData, TValue, TContext>,
    getLegacyFieldValue: () => LegacyTooltipFieldResolution
): any {
    if (colDef.tooltip !== undefined) {
        return _evaluateTooltipDefinition(colDef.tooltip, params);
    }
    if (_exists(colDef.tooltipField)) {
        const field = getLegacyFieldValue();
        if (field.resolved) {
            return field.value;
        }
    }
    const legacyGetter = colDef.tooltipValueGetter;
    return legacyGetter?.(params);
}

/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 * Group rows keep the inverse legacy precedence: `tooltipValueGetter` before `tooltipField`.
 */
export function _resolveGroupTooltipValue<TData, TValue, TContext>(
    colDef: ColDef<TData, TValue>,
    params: TooltipCallbackParams<TData, TValue, TContext>,
    getLegacyFieldValue: () => LegacyTooltipFieldResolution
): any {
    if (colDef.tooltip !== undefined) {
        return _evaluateTooltipDefinition(colDef.tooltip, params);
    }
    const legacyGetter = colDef.tooltipValueGetter;
    if (legacyGetter) {
        return legacyGetter(params);
    }
    if (_exists(colDef.tooltipField)) {
        const field = getLegacyFieldValue();
        if (field.resolved) {
            return field.value;
        }
    }
    return undefined;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _resolveHeaderTooltipValue<TData, TValue, TContext>(
    colDef: AbstractColDef<TData, TValue> | null | undefined,
    params: HeaderTooltipCallbackParams<TData, TValue, TContext>,
    componentValue?: any
): any {
    if (componentValue != null) {
        return componentValue;
    }

    const definition = colDef?.headerTooltip;
    const legacyGetter = colDef?.headerTooltipValueGetter;

    // Preserve the old string + getter precedence while allowing every new definition form to be authoritative.
    if (legacyGetter && (definition === undefined || typeof definition === 'string')) {
        return legacyGetter(params) ?? _evaluateTooltipDefinition(definition, params);
    }
    return _evaluateTooltipDefinition(definition, params);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _resolveHeaderTooltip(
    gos: GridOptionsService,
    params: HeaderTooltipCallbackParams,
    componentValue?: any
): ResolvedTooltip {
    const colDef = params.colDef;
    return _resolveTextTooltip(gos, {
        value: _resolveHeaderTooltipValue(colDef, params, componentValue),
        automatic: componentValue == null && colDef?.headerTooltip === undefined && !colDef?.headerTooltipValueGetter,
        params,
        componentDefinition:
            componentValue != null ? (colDef ?? undefined) : _getHeaderTooltipComponentDefinition(colDef),
    });
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isCellTooltipConfigured(colDef: ColDef): boolean {
    if (colDef.tooltip !== undefined) {
        return colDef.tooltip !== false;
    }
    return _exists(colDef.tooltipField) || colDef.tooltipValueGetter != null;
}

/** @internal AG_GRID_INTERNAL - Compatibility path for the deprecated `tooltipField`. */
export function _getLegacyTooltipFieldValue(data: any, field: string, containsDots: boolean): any {
    if (data == null) {
        return undefined;
    }
    return containsDots ? _getValueUsingDotField(data, field) : (data as Record<string, unknown>)[field];
}

export function _initColTooltip(column: AgColumn): void {
    const { colDef } = column;
    column.setTooltipEnabled(
        colDef.tooltip !== false &&
            (_isCellTooltipConfigured(colDef) ||
                colDef.tooltipComponent != null ||
                colDef.tooltipComponentSelector != null)
    );
}
