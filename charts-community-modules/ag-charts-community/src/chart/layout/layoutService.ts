import { BBox } from '../../scene/bbox';
import { Listeners } from '../../util/listeners';

export type LayoutStage = 'start-layout' | 'before-series';

export type AxisLabelLayout = {
    baseline: 'hanging' | 'bottom' | 'middle';
    align: 'start' | 'end' | 'center';
    rotation: number;
    fractionDigits: number;
    padding: number;
    format?: string;
};

export interface AxisLayout {
    rect: BBox;
    gridPadding: number;
    seriesAreaPadding: number;
    tickSize: number;
    label: AxisLabelLayout;
}

export interface LayoutCompleteEvent {
    type: 'layout-complete';
    chart: { width: number; height: number };
    series: { rect: BBox; paddedRect: BBox; visible: boolean };
    axes?: (AxisLayout & {
        id: string;
    })[];
}

export interface LayoutContext {
    shrinkRect: BBox;
}

export interface LayoutResult {
    shrinkRect: BBox;
}

type EventTypes = LayoutStage | 'layout-complete';
type LayoutListener = (event: LayoutCompleteEvent) => void;
type LayoutProcessor = (ctx: LayoutContext) => LayoutResult;

type Handler<T extends EventTypes> = T extends LayoutStage ? LayoutProcessor : LayoutListener;

function isLayoutStage(t: EventTypes): t is LayoutStage {
    return t !== 'layout-complete';
}

function isLayoutComplete(t: EventTypes): t is 'layout-complete' {
    return t === 'layout-complete';
}

export class LayoutService {
    private readonly layoutProcessors = new Listeners<LayoutStage, LayoutProcessor>();
    private readonly listeners = new Listeners<'layout-complete', LayoutListener>();

    public addListener<T extends EventTypes>(type: T, cb: Handler<T>): Symbol {
        if (isLayoutStage(type)) {
            return this.layoutProcessors.addListener(type, cb as any);
        } else if (isLayoutComplete(type)) {
            return this.listeners.addListener(type, cb as any);
        }

        throw new Error('AG Charts - unsupported listener type: ' + type);
    }

    public removeListener(listenerSymbol: Symbol) {
        this.listeners.removeListener(listenerSymbol);
        this.layoutProcessors.removeListener(listenerSymbol);
    }

    public dispatchPerformLayout(stage: LayoutStage, ctx: LayoutContext): LayoutResult {
        const result = this.layoutProcessors.reduceDispatch(
            stage,
            ({ shrinkRect }, ctx) => [{ ...ctx, shrinkRect }],
            ctx
        );

        return result ?? ctx;
    }

    public dispatchLayoutComplete(event: LayoutCompleteEvent) {
        this.listeners.dispatch('layout-complete', event);
    }
}
