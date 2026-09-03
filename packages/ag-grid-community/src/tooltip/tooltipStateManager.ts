import type { IComponent } from 'ag-stack';
import { BaseTooltipStateManager } from 'ag-stack';

import { _getTooltipCompDetails } from '../components/framework/userCompUtils';
import type { BeanCollection } from '../context/context';
import { isColumn } from '../entities/agColumn';
import type { AgEventTypeParams } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import type { AgGridCommon } from '../interfaces/iCommon';
import type { PopupPositionParams } from '../interfaces/iPopupPositionParams';
import type { ITooltipParams, TooltipLocation } from './tooltipComponent';
import type { TooltipSource, TooltipSourceParams } from './tooltipFeature';

export class TooltipStateManager extends BaseTooltipStateManager<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    ITooltipParams,
    TooltipSourceParams,
    TooltipLocation
> {
    private onColumnMovedEventCallback: (() => null) | undefined;

    public override postConstruct(): void {
        super.postConstruct();

        const unregister = this.beans.touchGesturesSvc?.registerLongPress({
            element: this.tooltipCtrl.getGui(),
            priority: 'fallback',
            isEnabled: () => this.canShowTooltip(),
            onLongPress: (event) => this.prepareToShowTooltip(event, 0),
        });
        if (unregister) {
            this.addDestroyFunc(unregister);
        }
    }

    protected override createTooltipComp(
        params: ITooltipParams<any, any, any>,
        callback: (comp: IComponent<ITooltipParams<any, any, any>>) => void
    ): void {
        const source = this.tooltipCtrl as TooltipSource;
        const userDetails = _getTooltipCompDetails(
            this.beans.userCompFactory,
            params,
            source.getTooltipComponentDefinition?.()
        );
        userDetails?.newAgStackInstance().then(callback);
    }

    protected override setEventHandlers(listener: () => void): void {
        [this.onColumnMovedEventCallback] = this.addManagedEventListeners({
            columnMoved: listener,
        });
    }

    protected override clearEventHandlers(): void {
        this.onColumnMovedEventCallback?.();
        this.onColumnMovedEventCallback = undefined;
    }

    protected override getPopupPositionParams(): PopupPositionParams {
        const params = this.tooltipCtrl.getAdditionalParams?.();
        const column = params?.column;
        return {
            column: column && isColumn(column) ? column : undefined,
            rowNode: params?.node,
            tooltipLocation: this.tooltipCtrl.getLocation?.() ?? 'UNKNOWN',
        };
    }
}
