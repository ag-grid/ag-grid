import type { ModuleInstance } from '../../module/baseModule';
import { BaseModuleInstance } from '../../module/module';
import type { ModuleContext } from '../../module/moduleContext';
import { BBox } from '../../scene/bbox';
import { RangeHandle } from './shapes/rangeHandle';
import { RangeMask } from './shapes/rangeMask';
import { RangeSelector } from './shapes/rangeSelector';
export declare class Navigator extends BaseModuleInstance implements ModuleInstance {
    private readonly ctx;
    protected readonly rs: RangeSelector;
    miniChart: unknown;
    private minHandleDragging;
    private maxHandleDragging;
    private panHandleOffset;
    enabled: boolean;
    mask: RangeMask;
    minHandle: RangeHandle;
    maxHandle: RangeHandle;
    height: number;
    min: number;
    max: number;
    margin: number;
    visible: boolean;
    private updateGroupVisibility;
    constructor(ctx: ModuleContext);
    protected x: number;
    protected y: number;
    protected width: number;
    performLayout({ shrinkRect }: {
        shrinkRect: BBox;
    }): Promise<{
        shrinkRect: BBox;
    }>;
    performCartesianLayout(opts: {
        seriesRect: BBox;
    }): Promise<void>;
    private onRangeChange;
    private onZoomChange;
    private onDragStart;
    private onDrag;
    private onDragStop;
    private stopHandleDragging;
}
