import type { BBox } from '../../scene/bbox';
import { Listeners } from '../../util/listeners';
type LayoutStage = 'start-layout' | 'before-series';
type LayoutComplete = 'layout-complete';
export interface AxisLayout {
    rect: BBox;
    gridPadding: number;
    seriesAreaPadding: number;
    tickSize: number;
    label: {
        fractionDigits: number;
        padding: number;
        format?: string;
    };
}
export interface LayoutCompleteEvent {
    type: 'layout-complete';
    chart: {
        width: number;
        height: number;
    };
    series: {
        rect: BBox;
        paddedRect: BBox;
        visible: boolean;
        shouldFlipXY?: boolean;
    };
    clipSeries: boolean;
    axes?: Array<AxisLayout & {
        id: string;
    }>;
}
export interface LayoutContext {
    shrinkRect: BBox;
}
type EventTypes = LayoutStage | LayoutComplete;
type LayoutListener = (event: LayoutCompleteEvent) => void;
type LayoutProcessor = (ctx: LayoutContext) => LayoutContext;
type Handler<T extends EventTypes> = T extends LayoutStage ? LayoutProcessor : LayoutListener;
export declare class LayoutService extends Listeners<EventTypes, Handler<EventTypes>> {
    private readonly layoutComplete;
    addListener<T extends EventTypes>(eventType: T, handler: Handler<T>): () => void;
    dispatchPerformLayout<T extends LayoutStage>(stage: T, ctx: LayoutContext): LayoutContext;
    dispatchLayoutComplete(event: LayoutCompleteEvent): void;
    protected isLayoutStage(eventType: EventTypes): eventType is LayoutStage;
    protected isLayoutComplete(eventType: EventTypes): eventType is LayoutComplete;
}
export {};
