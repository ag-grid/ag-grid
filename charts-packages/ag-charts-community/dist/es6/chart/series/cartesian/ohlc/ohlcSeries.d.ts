import { SeriesNodeDatum, TooltipRendererParams } from "../../series";
import { LegendDatum } from "../../../legend";
import { OHLC } from "./marker/ohlc";
import { CartesianSeries } from "../cartesianSeries";
import { Observable } from "../../../../util/observable";
import { ChartAxisDirection } from "../../../chartAxis";
interface GroupSelectionDatum extends SeriesNodeDatum {
    date: number;
    open: number;
    high: number;
    low: number;
    close: number;
    width: number;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
}
export interface OHLCTooltipRendererParams extends TooltipRendererParams {
    dateKey?: string;
    dateName?: string;
    openKey?: string;
    openName?: string;
    highKey?: string;
    highName?: string;
    lowKey?: string;
    lowName?: string;
    closeKey?: string;
    closeName?: string;
}
export declare class OHLCSeries extends CartesianSeries {
    static className: string;
    private xDomain;
    private yDomain;
    private dateData;
    private openData;
    private highData;
    private lowData;
    private closeData;
    private dirtyDateData;
    private dirtyOpenData;
    private dirtyHighData;
    private dirtyLowData;
    private dirtyCloseData;
    private groupSelection;
    readonly marker: OHLCSeriesMarker;
    constructor();
    protected onDataChange(): void;
    protected onMarkerTypeChange(): void;
    title?: string;
    protected _dateKey: string;
    dateKey: string;
    protected _openKey: string;
    openKey: string;
    protected _highKey: string;
    highKey: string;
    protected _lowKey: string;
    lowKey: string;
    protected _closeKey: string;
    closeKey: string;
    private _labelKey?;
    labelKey: string | undefined;
    dateName: string;
    openName: string;
    highName: string;
    lowName: string;
    closeName: string;
    labelName?: string;
    processData(): boolean;
    private calculateDomain;
    getDomain(direction: ChartAxisDirection): any[];
    highlightStyle: {
        fill?: string;
        stroke?: string;
    };
    protected highlightedDatum?: GroupSelectionDatum;
    update(): void;
    private dateFormatter;
    getTooltipHtml(nodeDatum: GroupSelectionDatum): string;
    tooltipRenderer?: (params: OHLCTooltipRendererParams) => string;
    listSeriesItems(legendData: LegendDatum[]): void;
}
export declare class OHLCSeriesMarker extends Observable {
    /**
     * Marker constructor function. A series will create one marker instance per data point.
     */
    type: new () => OHLC;
    upFill?: string;
    downFill?: string;
    noChangeFill?: string;
    upStroke?: string;
    downStroke?: string;
    noChangeStroke?: string;
    strokeWidth: number;
    fillOpacity: number;
    strokeOpacity: number;
}
export {};
