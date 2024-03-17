import { MarkerFormat, MarkerFormatterParams, CrosshairLineOptions } from 'ag-grid-community';
import { _Scene } from 'ag-charts-community';
import { Point, SeriesNodeDatum, Sparkline } from '../sparkline';
interface AreaNodeDatum extends SeriesNodeDatum {
}
interface PathDatum extends SeriesNodeDatum {
    point: Point;
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
export declare class AreaSparkline extends Sparkline {
    static className: string;
    fill: string;
    protected strokePath: _Scene.Path;
    protected fillPath: _Scene.Path;
    protected xCrosshairLine: _Scene.Line;
    protected yCrosshairLine: _Scene.Line;
    private areaSparklineGroup;
    private xAxisLine;
    private markers;
    private markerSelection;
    private markerSelectionData;
    readonly marker: SparklineMarker;
    readonly line: SparklineLine;
    readonly crosshairs: SparklineCrosshairs;
    constructor();
    protected markerFactory(): _Scene.Marker;
    protected getNodeData(): AreaNodeDatum[];
    protected update(): void;
    protected updateYScaleDomain(): void;
    protected generateNodeData(): {
        nodeData: AreaNodeDatum[];
        fillData: PathDatum[];
        strokeData: PathDatum[];
    } | undefined;
    protected updateAxisLine(): void;
    private updateSelection;
    protected updateNodes(): void;
    updateStroke(strokeData: PathDatum[]): void;
    updateFill(areaData: PathDatum[]): void;
    protected updateXCrosshairLine(): void;
    protected updateYCrosshairLine(): void;
    getTooltipHtml(datum: SeriesNodeDatum): string | undefined;
}
export {};
