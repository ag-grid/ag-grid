import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { ColDef, ColGroupDef } from '../entities/colDef';
import { _addGridCommonParams } from '../gridOptionsUtils';
import type { HeaderCellCtrl } from '../headerRendering/cells/column/headerCellCtrl';
import type { HeaderGroupCellCtrl } from '../headerRendering/cells/columnGroup/headerGroupCellCtrl';
import type { HeaderTooltipCallbackParams } from './tooltipComponent';
import type { TooltipFeature, TooltipSource } from './tooltipFeature';
import { _resolveHeaderTooltip } from './tooltipValueUtils';

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
    getTextElement: () => HTMLElement | undefined;
}

function createHeaderTooltipSource(params: HeaderTooltipSourceParams): TooltipSource {
    const { beans, eGui, location, column, getColDef, getComponentTooltip, getDisplayName } = params;

    return {
        getGui: () => eGui,
        getTextElement: params.getTextElement,
        getTooltip: () => {
            const displayName = getDisplayName();
            const colDef = getColDef() ?? undefined;
            const { value, shouldDisplay } = getComponentTooltip();
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
            return { ..._resolveHeaderTooltip(beans.gos, callbackParams, value), shouldDisplay };
        },
        getLocation: () => location,
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
        getTextElement: () => ctrl.getTooltipTextElement(),
    });
    return beans.tooltipCoreSvc!.registerTooltip(ctrl, source, current);
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
        getTextElement: () => ctrl.getTooltipTextElement(),
    });
    return beans.tooltipCoreSvc!.registerTooltip(ctrl, source, current);
}
