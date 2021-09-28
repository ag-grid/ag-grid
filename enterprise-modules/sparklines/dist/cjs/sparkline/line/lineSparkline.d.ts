import { Path } from '../../scene/shape/path';
import { Observable } from '../../util/observable';
import { Point, SeriesNodeDatum, Sparkline } from '../sparkline';
import { MarkerFormat, MarkerFormatterParams } from "@ag-grid-community/core";
interface LineNodeDatum extends SeriesNodeDatum {
    readonly point: Point;
}
declare class SparklineMarker extends Observable {
    enabled: boolean;
    shape: string;
    size: number;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
    formatter?: (params: MarkerFormatterParams) => MarkerFormat;
}
declare class SparklineLine extends Observable {
    stroke: string;
    strokeWidth: number;
}
export declare class LineSparkline extends Sparkline {
    static className: string;
    private lineSparklineGroup;
    protected linePath: Path;
    private markers;
    private markerSelection;
    private markerSelectionData;
    readonly marker: SparklineMarker;
    readonly line: SparklineLine;
    constructor();
    protected getNodeData(): LineNodeDatum[];
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
    getTooltipHtml(datum: SeriesNodeDatum): string | undefined;
}
export {};
