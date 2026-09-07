import type { AgTooltipFeature, TooltipCtrl } from 'ag-stack';
import { _isElementOverflowingCallback } from 'ag-stack';

import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColDef, ColGroupDef } from '../entities/colDef';
import type { RowNode } from '../entities/rowNode';
import type { AgEventTypeParams } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import type { AgGridCommon } from '../interfaces/iCommon';
import type { ITooltipParams, TooltipLocation } from './tooltipComponent';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface TooltipSourceParams {
    column?: AgColumn | AgColumnGroup | AgProvidedColumnGroup;
    colDef?: ColDef | ColGroupDef;
    rowIndex?: number;
    node?: RowNode;
    data?: any;
    valueFormatted?: string | null;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface TooltipSource extends TooltipCtrl<TooltipLocation, TooltipSourceParams> {
    /** The current definition used to select a custom component, or `undefined` for the default component. */
    getTooltipComponentDefinition(): ColDef | ColGroupDef | undefined;
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
export function _getShouldDisplayTooltip(
    gos: GridOptionsService,
    getElement: () => HTMLElement | undefined
): (() => boolean) | undefined {
    return _isShowTooltipWhenTruncated(gos) ? _isElementOverflowingCallback(getElement) : undefined;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type TooltipFeature = AgTooltipFeature<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    ITooltipParams,
    TooltipSourceParams,
    TooltipLocation
>;
