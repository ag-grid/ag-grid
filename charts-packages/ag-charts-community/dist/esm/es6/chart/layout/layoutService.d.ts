import { BBox } from '../../scene/bbox';
export declare type LayoutStage = 'before-series';
export interface LayoutCompleteEvent {
    type: 'layout-complete';
    series: {
        rect: BBox;
        visible: boolean;
    };
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
