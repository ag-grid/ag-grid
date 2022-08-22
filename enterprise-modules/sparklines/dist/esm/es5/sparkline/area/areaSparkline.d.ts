import { Path } from '../../scene/shape/path';
import { Line } from '../../scene/shape/line';
import { Point, SeriesNodeDatum, Sparkline } from '../sparkline';
import { MarkerFormat, MarkerFormatterParams } from '@ag-grid-community/core';
import { CrosshairLineOptions } from '@ag-grid-community/core';
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
    protected strokePath: Path;
    protected fillPath: Path;
    protected xCrosshairLine: Line;
    protected yCrosshairLine: Line;
    private areaSparklineGroup;
    private fillPathData;
    private strokePathData;
    private xAxisLine;
    private markers;
    private markerSelection;
    private markerSelectionData;
    readonly marker: SparklineMarker;
    readonly line: SparklineLine;
    readonly crosshairs: SparklineCrosshairs;
    constructor();
    protected getNodeData(): AreaNodeDatum[];
    /**
     * If marker shape is changed, this method should be called to remove the previous marker nodes selection.
     */
    private onMarkerShapeChange;
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
