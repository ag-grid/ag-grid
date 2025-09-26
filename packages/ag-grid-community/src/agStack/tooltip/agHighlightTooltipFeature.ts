import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { AgEvent } from '../interfaces/agEvent';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IEventEmitter } from '../interfaces/iEventEmitter';
import type { IPropertiesService } from '../interfaces/iProperties';
import type { TooltipCtrl } from '../interfaces/iTooltip';
import { AgTooltipFeature } from './agTooltipFeature';
import type { BaseTooltipParams } from './baseTooltipStateManager';
import { TooltipTrigger } from './baseTooltipStateManager';

export type HighlightTooltipEventType = 'itemHighlighted';
export interface HighlightTooltipEvent extends AgEvent<HighlightTooltipEventType> {
    highlighted: boolean;
}

export class AgHighlightTooltipFeature<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties, TCommon>,
    TTooltipParams extends BaseTooltipParams<TLocation>,
    TTooltipCtrlParams,
    TLocation extends string,
> extends AgTooltipFeature<
    TBeanCollection,
    TProperties,
    TGlobalEvents,
    TCommon,
    TPropertiesService,
    TTooltipParams,
    TTooltipCtrlParams,
    TLocation
> {
    private tooltipMode: TooltipTrigger;

    constructor(
        ctrl: TooltipCtrl<TLocation, TTooltipCtrlParams>,
        private readonly highlightTracker: IEventEmitter<HighlightTooltipEventType>,
        beans?: TBeanCollection
    ) {
        super(ctrl, beans);
        this.onHighlight = this.onHighlight.bind(this);
    }

    public override postConstruct(): void {
        super.postConstruct();
        this.wireHighlightListeners();
    }

    private wireHighlightListeners(): void {
        this.addManagedPropertyListener('tooltipTrigger', ({ currentValue }) => {
            this.setTooltipMode(currentValue);
        });

        this.setTooltipMode(this.gos.get('tooltipTrigger'));
        this.highlightTracker.addEventListener('itemHighlighted', this.onHighlight);
    }

    private onHighlight(event: HighlightTooltipEvent): void {
        if (this.tooltipMode !== TooltipTrigger.FOCUS) {
            return;
        }

        if (event.highlighted) {
            this.attemptToShowTooltip();
        } else {
            this.attemptToHideTooltip();
        }
    }

    private setTooltipMode(tooltipTriggerMode: 'focus' | 'hover' = 'focus'): void {
        this.tooltipMode = tooltipTriggerMode === 'focus' ? TooltipTrigger.FOCUS : TooltipTrigger.HOVER;
    }

    public override destroy() {
        this.highlightTracker.removeEventListener('itemHighlighted', this.onHighlight);
        super.destroy();
    }
}
