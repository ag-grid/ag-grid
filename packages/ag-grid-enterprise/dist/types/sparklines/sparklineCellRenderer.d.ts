import { Component, ICellRenderer, ISparklineCellRendererParams } from 'ag-grid-community';
export declare class SparklineCellRenderer extends Component implements ICellRenderer {
    private static TEMPLATE;
    private eSparkline;
    private resizeObserverService;
    private sparklineTooltipSingleton;
    private sparkline?;
    constructor();
    init(params: ISparklineCellRendererParams): void;
    refresh(params: ISparklineCellRendererParams): boolean;
    destroy(): void;
}
