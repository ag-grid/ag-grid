import { Chart } from './chart';
import { BBox } from '../scene/bbox';
import { ClipRect } from '../scene/clipRect';
import { Navigator } from './navigator/navigator';
export declare class CartesianChart extends Chart {
    static className: string;
    static type: 'cartesian' | 'groupedCategory';
    constructor(document?: Document);
    readonly seriesRoot: ClipRect;
    readonly navigator: Navigator;
    performLayout(): void;
    private _onTouchStart;
    private _onTouchMove;
    private _onTouchEnd;
    private _onTouchCancel;
    protected setupDomListeners(chartElement: HTMLCanvasElement): void;
    protected cleanupDomListeners(chartElement: HTMLCanvasElement): void;
    private getTouchOffset;
    protected onTouchStart(event: TouchEvent): void;
    protected onTouchMove(event: TouchEvent): void;
    protected onTouchEnd(_event: TouchEvent): void;
    protected onTouchCancel(_event: TouchEvent): void;
    protected onMouseDown(event: MouseEvent): void;
    protected onMouseMove(event: MouseEvent): void;
    protected onMouseUp(event: MouseEvent): void;
    protected onMouseOut(event: MouseEvent): void;
    updateAxes(inputShrinkRect: BBox): {
        seriesRect: BBox;
    };
    private updateAxesPass;
}
