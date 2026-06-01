import type { IPopupService } from 'ag-stack';
import { BasePopupService } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import type { BeanCollection } from '../context/context';
import type { AgEventTypeParams } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import type { PostProcessPopupParams } from '../interfaces/iCallbackParams';
import type { AgGridCommon, WithoutGridCommon } from '../interfaces/iCommon';
import type { PopupPositionParams } from '../interfaces/iPopupPositionParams';
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
        return this.beans.ctrlsSvc.get('gridCtrl').getGui();
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
            const { column, rowNode } = params ?? {};
            const postProcessParams: WithoutGridCommon<PostProcessPopupParams> = {
                column,
                rowNode,
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
