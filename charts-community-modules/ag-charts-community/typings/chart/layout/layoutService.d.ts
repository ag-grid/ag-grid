import type { BBox } from '../../scene/bbox';
export declare type LayoutStage = 'start-layout' | 'before-series';
export declare type AxisLabelLayout = {
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
    chart: {
        width: number;
        height: number;
    };
    series: {
        rect: BBox;
        paddedRect: BBox;
        hoverRect: BBox;
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
//# sourceMappingURL=layoutService.d.ts.map