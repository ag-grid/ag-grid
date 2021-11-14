import { Path } from '../../scene/shape/path';
import { Observable } from '../../util/observable';
import { Point, SeriesNodeDatum, Sparkline } from '../sparkline';
import { MarkerFormat, MarkerFormatterParams } from "@ag-grid-community/core";
interface AreaNodeDatum extends SeriesNodeDatum {
}
interface PathDatum extends SeriesNodeDatum {
    point: Point;
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
export declare class AreaSparkline extends Sparkline {
    static className: string;
    fill: string;
    private areaSparklineGroup;
    protected strokePath: Path;
    protected fillPath: Path;
    private fillPathData;
    private strokePathData;
    private xAxisLine;
    private markers;
    private markerSelection;
    private markerSelectionData;
    readonly marker: SparklineMarker;
    readonly line: SparklineLine;
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
    getTooltipHtml(datum: SeriesNodeDatum): string | undefined;
}
export {};
