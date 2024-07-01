import type { BeanCollection, ICellRenderer, ISparklineCellRendererParams } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
export declare class SparklineCellRenderer extends Component implements ICellRenderer {
    private resizeObserverService;
    private sparklineTooltipSingleton;
    wireBeans(beans: BeanCollection): void;
    private readonly eSparkline;
    private sparkline?;
    constructor();
    init(params: ISparklineCellRendererParams): void;
    refresh(params: ISparklineCellRendererParams): boolean;
    destroy(): void;
}
