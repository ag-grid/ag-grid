// ag-grid-enterprise v21.0.1
import { Group } from "../../scene/group";
import { Chart } from "../chart";
import { LegendDatum } from "../legend";
import { Shape } from "../../scene/shape/shape";
/**
 * `D` - raw series datum, an element in the {@link Series.data} array.
 * `SeriesNodeDatum` - processed series datum used in node selections,
 *                     contains information used to render pie sectors, bars, line markers, etc.
 */
export interface SeriesNodeDatum {
    seriesDatum: any;
}
export declare abstract class Series<C extends Chart> {
    readonly id: string;
    /**
     * The group node that contains all the nodes used to render this series.
     */
    readonly group: Group;
    private createId;
    protected _data: any[];
    data: any[];
    protected _chart: C | null;
    abstract chart: C | null;
    protected _visible: boolean;
    visible: boolean;
    abstract getDomainX(): any[];
    abstract getDomainY(): any[];
    abstract processData(): boolean;
    abstract update(): void;
    abstract getTooltipHtml(nodeDatum: SeriesNodeDatum): string;
    tooltipEnabled: boolean;
    /**
     * @private
     * Populates the given {@param data} array with the items of this series
     * that should be shown in the legend. It's up to the series to determine
     * what is considered an item. An item could be the series itself or some
     * part of the series.
     * @param data
     */
    abstract listSeriesItems(data: LegendDatum[]): void;
    toggleSeriesItem(itemId: any, enabled: boolean): void;
    private _showInLegend;
    showInLegend: boolean;
    abstract highlight(node: Shape): void;
    abstract dehighlight(): void;
    scheduleLayout(): void;
    scheduleData(): void;
}
