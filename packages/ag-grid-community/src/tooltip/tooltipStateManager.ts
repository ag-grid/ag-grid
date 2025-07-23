import type { IComponent } from '../agStack/interfaces/iComponent';
import { BaseTooltipStateManager } from '../agStack/tooltip/baseTooltipStateManager';
import { _getTooltipCompDetails } from '../components/framework/userCompUtils';
import type { BeanCollection } from '../context/context';
import type { AgEventTypeParams } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import type { AgGridCommon } from '../interfaces/iCommon';
import type { ITooltipParams, TooltipLocation } from './tooltipComponent';
import type { ITooltipCtrlParams } from './tooltipFeature';

export class TooltipStateManager extends BaseTooltipStateManager<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    ITooltipParams,
    ITooltipCtrlParams,
    TooltipLocation
> {
    private onColumnMovedEventCallback: (() => null) | undefined;

    protected override createTooltipComp(
        params: ITooltipParams<any, any, any>,
        callback: (comp: IComponent<ITooltipParams<any, any, any>>) => void
    ): void {
        const userDetails = _getTooltipCompDetails(this.beans.userCompFactory, params);
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
}
