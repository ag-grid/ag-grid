import type { AgTooltipFeature, TooltipCtrl } from 'ag-stack';
import { _isElementOverflowingCallback } from 'ag-stack';

import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { ColDef, ColGroupDef } from '../entities/colDef';
import type { RowNode } from '../entities/rowNode';
import type { AgEventTypeParams } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import type { AgGridCommon } from '../interfaces/iCommon';
import type { ITooltipParams, TooltipLocation } from './tooltipComponent';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface ITooltipCtrlParams {
    column?: AgColumn | AgColumnGroup;
    colDef?: ColDef | ColGroupDef;
    rowIndex?: number;
    node?: RowNode;
    data?: any;
    valueFormatted?: string;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface ITooltipCtrl extends TooltipCtrl<TooltipLocation, ITooltipCtrlParams> {}

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
    ITooltipCtrlParams,
    TooltipLocation
>;
