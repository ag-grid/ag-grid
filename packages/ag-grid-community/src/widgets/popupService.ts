import type { IPopupService } from 'ag-stack';
import { BasePopupService, _getDocument } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import type { BeanCollection } from '../context/context';
import type { AgEventTypeParams } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import { _getDomData } from '../gridOptionsUtils';
import type { AbstractHeaderCellCtrl } from '../headerRendering/cells/abstractCell/abstractHeaderCellCtrl';
import { DOM_DATA_KEY_HEADER_CTRL } from '../headerRendering/cells/abstractCell/abstractHeaderCellCtrl';
import type { PostProcessPopupParams } from '../interfaces/iCallbackParams';
import type { AgGridCommon, WithoutGridCommon } from '../interfaces/iCommon';
import type { PopupPositionParams } from '../interfaces/iPopupPositionParams';
import { _getCellCtrlForEventTarget } from '../rendering/renderUtils';
import { _isStopPropagationForAgGrid } from '../utils/gridEvent';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class PopupService
    extends BasePopupService<
        BeanCollection,
        GridOptionsWithDefaults,
        AgEventTypeParams,
        AgGridCommon<any, any>,
        GridOptionsService,
        PopupPositionParams
    >
    implements NamedBean, IPopupService<PopupPositionParams>
{
    protected getDefaultPopupParent(): HTMLElement {
        return this.beans.ctrlsSvc.get('gridCtrl')?.getGui() ?? _getDocument(this.beans).body;
    }

    protected override getTooltipSourceRect(eventSource: HTMLElement) {
        const rect = super.getTooltipSourceRect(eventSource);
        const { gos, beans } = this;
        const headerCtrl = _getDomData(gos, eventSource, DOM_DATA_KEY_HEADER_CTRL) as
            AbstractHeaderCellCtrl | undefined;
        const column = headerCtrl?.column ?? _getCellCtrlForEventTarget(gos, eventSource)?.column;
        if (column && !column.pinned) {
            const viewport = beans.ctrlsSvc.getGridBodyCtrl().eGridViewport;
            const bounds = viewport.getBoundingClientRect();
            const scale = viewport.offsetWidth ? bounds.width / viewport.offsetWidth : 1;
            const left = bounds.left + viewport.clientLeft * scale;
            // Sticky pinned columns occlude scrolling cells without clipping their DOM ancestors.
            rect.left = Math.max(rect.left, left + beans.visibleCols.getLeftStickyColumnContainerWidth() * scale);
            rect.right = Math.min(
                rect.right,
                left + (viewport.clientWidth - beans.visibleCols.getRightStickyColumnContainerWidth()) * scale
            );
        }
        return rect;
    }

    public callPostProcessPopup(
        params: PopupPositionParams | undefined,
        type: string,
        ePopup: HTMLElement,
        eventSource?: HTMLElement | null,
        mouseEvent?: MouseEvent | Touch | null
    ): void {
        const callback = this.gos.getCallback('postProcessPopup');
        if (callback) {
            const { column, rowNode, tooltipLocation, tooltipPosition } = params ?? {};
            const postProcessParams: WithoutGridCommon<PostProcessPopupParams> = {
                column,
                rowNode,
                tooltipLocation,
                tooltipPosition,
                ePopup,
                type,
                eventSource,
                mouseEvent,
            };
            callback(postProcessParams);
        }
    }

    public getActivePopups(): HTMLElement[] {
        return this.popupList.map((popup) => popup.element);
    }

    public hasAnchoredPopup(): boolean {
        return this.popupList.some((popup) => popup.isAnchored);
    }

    protected override isStopPropagation(event: Event): boolean {
        return _isStopPropagationForAgGrid(event);
    }
}
