import { BBox } from '../../scene/bbox';
export declare type LayoutStage = 'before-series';
export declare type AxisLabelLayout = {
    baseline: 'hanging' | 'bottom' | 'middle';
    align: 'start' | 'end' | 'center';
    rotation: number;
    fractionDigits: number;
};
export interface AxisLayout {
    rect: BBox;
    label: AxisLabelLayout;
}
export interface LayoutCompleteEvent {
    type: 'layout-complete';
    series: {
        rect: BBox;
        visible: boolean;
    };
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
declare type EventTypes = LayoutStage | 'layout-complete';
declare type LayoutListener = (event: LayoutCompleteEvent) => void;
declare type LayoutProcessor = (ctx: LayoutContext) => LayoutResult;
declare type Handler<T extends EventTypes> = T extends LayoutStage ? LayoutProcessor : LayoutListener;
export declare class LayoutService {
    private readonly layoutProcessors;
    private readonly listeners;
    addListener<T extends EventTypes>(type: T, cb: Handler<T>): Symbol;
    removeListener(listenerSymbol: Symbol): void;
    dispatchPerformLayout(stage: LayoutStage, ctx: LayoutContext): LayoutResult;
    dispatchLayoutComplete(event: LayoutCompleteEvent): void;
}
export {};
