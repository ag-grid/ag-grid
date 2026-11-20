import { _isElementOverflowingCallback } from 'ag-stack';

import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { ColDef, ColGroupDef } from '../entities/colDef';
import { _addGridCommonParams } from '../gridOptionsUtils';
import type { HeaderCellCtrl } from '../headerRendering/cells/column/headerCellCtrl';
import type { HeaderGroupCellCtrl } from '../headerRendering/cells/columnGroup/headerGroupCellCtrl';
import type { HeaderTooltipCallbackParams } from './tooltipComponent';
import type { TooltipFeature, TooltipSource } from './tooltipFeature';
import { _getHeaderTooltipComponentDefinition, _isShowTooltipWhenTruncated } from './tooltipFeature';
import { _resolveHeaderTooltipValue } from './tooltipValueUtils';

export interface ComponentTooltip {
    value?: any;
    shouldDisplay?: () => boolean;
}

interface HeaderTooltipSourceParams {
    beans: BeanCollection;
    eGui: HTMLElement;
    location: 'header' | 'headerGroup';
    column: AgColumn | AgColumnGroup;
    getColDef: () => ColDef | ColGroupDef | null | undefined;
    getComponentTooltip: () => ComponentTooltip;
    getDisplayName: () => string | null;
    overflowElementSelector: string;
    hasCustomHeader: () => boolean;
}

function createHeaderTooltipSource(params: HeaderTooltipSourceParams): TooltipSource {
    const { beans, eGui, location, column, getColDef, getComponentTooltip, getDisplayName } = params;
    const isOverflowing = _isElementOverflowingCallback(
        () => eGui.querySelector(params.overflowElementSelector) as HTMLElement | undefined
    );

    return {
        getGui: () => eGui,
        getTooltip: () => {
            const displayName = getDisplayName();
            const colDef = getColDef() ?? undefined;
            const { value } = getComponentTooltip();
            const sourceParams = {
                colDef,
                column,
                value: displayName,
                valueFormatted: displayName,
            };
            const callbackParams = _addGridCommonParams<HeaderTooltipCallbackParams>(beans.gos, {
                ...sourceParams,
                location,
            });
            return {
                value: _resolveHeaderTooltipValue(colDef, callbackParams, value),
                componentDefinition: value != null ? colDef : _getHeaderTooltipComponentDefinition(colDef),
                params: sourceParams,
            };
        },
        getLocation: () => location,
        shouldDisplayTooltip: () => {
            const componentShouldDisplay = getComponentTooltip().shouldDisplay;
            if (componentShouldDisplay) {
                return componentShouldDisplay();
            }
            return !_isShowTooltipWhenTruncated(beans.gos) || params.hasCustomHeader() || isOverflowing();
        },
    };
}

export function _setupHeaderTooltip(
    beans: BeanCollection,
    ctrl: HeaderCellCtrl,
    current: TooltipFeature | undefined,
    getComponentTooltip: () => ComponentTooltip
): TooltipFeature | undefined {
    if (!ctrl.isAlive()) {
        return current;
    }
    const { column, eGui } = ctrl;

    const source = createHeaderTooltipSource({
        beans,
        eGui,
        location: 'header',
        column,
        getColDef: () => column.colDef,
        getComponentTooltip,
        getDisplayName: () => beans.colNames.getDisplayNameForColumn(column, 'header', true),
        overflowElementSelector: '.ag-header-cell-text',
        hasCustomHeader: () => !!column.colDef.headerComponent,
    });
    return beans.tooltipSvc!.registerTooltip(ctrl, source, current);
}

export function _setupHeaderGroupTooltip(
    beans: BeanCollection,
    ctrl: HeaderGroupCellCtrl,
    current: TooltipFeature | undefined,
    getComponentTooltip: () => ComponentTooltip
): TooltipFeature | undefined {
    if (!ctrl.isAlive()) {
        return current;
    }
    const { column, eGui } = ctrl;

    const source = createHeaderTooltipSource({
        beans,
        eGui,
        location: 'headerGroup',
        column,
        getColDef: () => column.getColGroupDef(),
        getComponentTooltip,
        getDisplayName: () => beans.colNames.getDisplayNameForColumnGroup(column, 'header'),
        overflowElementSelector: '.ag-header-group-text',
        hasCustomHeader: () => !!column.getColGroupDef()?.headerGroupComponent,
    });
    return beans.tooltipSvc!.registerTooltip(ctrl, source, current);
}
