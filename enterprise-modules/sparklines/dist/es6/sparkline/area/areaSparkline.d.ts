import { Path } from '../../scene/shape/path';
import { Observable } from '../../util/observable';
import { SeriesNodeDatum, Sparkline } from '../sparkline';
import { MarkerFormat, MarkerFormatterParams } from "@ag-grid-community/core";
interface AreaNodeDatum extends SeriesNodeDatum {
}
interface AreaPathDatum extends SeriesNodeDatum {
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
    protected skipInvalidYs: boolean;
    private areaSparklineGroup;
    protected strokePath: Path;
    protected fillPath: Path;
    private areaPathData;
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
        areaData: AreaPathDatum[];
    } | undefined;
    protected updateXAxisLine(): void;
    private updateSelection;
    protected updateNodes(): void;
    updateStroke(nodeData: SeriesNodeDatum[]): void;
    updateFill(areaData: SeriesNodeDatum[]): void;
    getTooltipHtml(datum: SeriesNodeDatum): string | undefined;
}
export {};
