import { MarkerFormat, MarkerFormatterParams, CrosshairLineOptions } from 'ag-grid-community';
import { _Scene } from 'ag-charts-community';
import { Point, SeriesNodeDatum, Sparkline } from '../sparkline';
interface LineNodeDatum extends SeriesNodeDatum {
    readonly point: Point;
}
declare class SparklineMarker {
    enabled: boolean;
    shape: string;
    size: number;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
    formatter?: (params: MarkerFormatterParams) => MarkerFormat;
}
declare class SparklineLine {
    stroke: string;
    strokeWidth: number;
}
declare class SparklineCrosshairs {
    xLine: CrosshairLineOptions;
    yLine: CrosshairLineOptions;
}
export declare class LineSparkline extends Sparkline {
    static className: string;
    protected linePath: _Scene.Path;
    protected xCrosshairLine: _Scene.Line;
    protected yCrosshairLine: _Scene.Line;
    private lineSparklineGroup;
    private markers;
    private markerSelection;
    private markerSelectionData;
    readonly marker: SparklineMarker;
    readonly line: SparklineLine;
    readonly crosshairs: SparklineCrosshairs;
    constructor();
    protected getNodeData(): LineNodeDatum[];
    protected markerFactory(): _Scene.Marker;
    /**
     * If marker shape is changed, this method should be called to remove the previous marker nodes selection.
     */
    private onMarkerShapeChange;
    protected update(): void;
    protected updateYScaleDomain(): void;
    protected generateNodeData(): LineNodeDatum[] | undefined;
    private updateSelection;
    protected updateNodes(): void;
    protected updateLine(): void;
    protected updateXCrosshairLine(): void;
    protected updateYCrosshairLine(): void;
    getTooltipHtml(datum: SeriesNodeDatum): string | undefined;
}
export {};
