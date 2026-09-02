import { _isElementOverflowingCallback } from 'ag-stack';

import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { ColDef, ColGroupDef } from '../entities/colDef';
import { _addGridCommonParams } from '../gridOptionsUtils';
import type { TooltipCallbackParams } from './tooltipComponent';
import type { TooltipSource } from './tooltipFeature';
import { _getHeaderTooltipComponentDefinition, _isShowTooltipWhenTruncated } from './tooltipFeature';
import { _resolveHeaderTooltipValue } from './tooltipValueUtils';

interface ComponentTooltip {
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

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _createHeaderTooltipSource(params: HeaderTooltipSourceParams): TooltipSource {
    const { beans, eGui, location, column, getColDef, getComponentTooltip, getDisplayName } = params;
    let latestDisplayName: string | null | undefined;
    const isOverflowing = _isElementOverflowingCallback(
        () => eGui.querySelector(params.overflowElementSelector) as HTMLElement | undefined
    );

    const getCallbackParams = () => {
        const displayName = getDisplayName();
        const colDef = getColDef();
        latestDisplayName = displayName;
        return _addGridCommonParams<TooltipCallbackParams>(beans.gos, {
            location,
            colDef,
            column,
            value: displayName,
            valueFormatted: displayName,
        });
    };

    return {
        getGui: () => eGui,
        getTooltipComponentDefinition: () => {
            const colDef = getColDef() ?? undefined;
            return getComponentTooltip().value != null ? colDef : _getHeaderTooltipComponentDefinition(colDef);
        },
        getLocation: () => location,
        getTooltipValue: () => {
            const { value } = getComponentTooltip();
            return _resolveHeaderTooltipValue(getColDef(), getCallbackParams(), value);
        },
        shouldDisplayTooltip: () => {
            const componentShouldDisplay = getComponentTooltip().shouldDisplay;
            if (componentShouldDisplay) {
                return componentShouldDisplay();
            }
            return !_isShowTooltipWhenTruncated(beans.gos) || params.hasCustomHeader() || isOverflowing();
        },
        getAdditionalParams: () => {
            const colDef = getColDef();
            return {
                column,
                ...(colDef ? { colDef } : {}),
                valueFormatted: latestDisplayName,
            };
        },
    };
}
