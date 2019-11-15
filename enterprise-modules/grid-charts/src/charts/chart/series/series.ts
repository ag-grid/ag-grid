import { Group } from "../../scene/group";
import { Chart } from "../chart";
import { LegendDatum } from "../legend";
import { Shape } from "../../scene/shape/shape";
import { Observable, reactive } from "../../util/observable";
import { CartesianChart } from "../cartesianChart";

/**
 * `D` - raw series datum, an element in the {@link Series.data} array.
 * `SeriesNodeDatum` - processed series datum used in node selections,
 *                     contains information used to render pie sectors, bars, line markers, etc.
 */
export interface SeriesNodeDatum {
    seriesDatum: any;
}

export interface TooltipRendererParams {
    datum: any;
    title?: string;
    color?: string;
}

export interface CartesianTooltipRendererParams extends TooltipRendererParams {
    xKey: string;
    xName?: string;

    yKey: string;
    yName?: string;
}

export interface PolarTooltipRendererParams extends TooltipRendererParams {
    angleKey: string;
    angleName?: string;

    radiusKey?: string;
    radiusName?: string;
}

export interface HighlightStyle {
    fill?: string;
    stroke?: string;
}

export abstract class Series<C extends Chart> extends Observable {

    readonly id: string = this.createId();

    /**
     * The group node that contains all the nodes used to render this series.
     */
    readonly group: Group = new Group();

    tooltipEnabled: boolean = false;

    @reactive(['data']) data: any[] = [];
    @reactive(['data']) chart?: C;
    @reactive(['data']) visible = true;
    @reactive(['layout']) showInLegend = true;

    protected constructor() {
        super();

        this.addEventListener('layout', () => this.scheduleLayout.bind(this));
        this.addEventListener('data', () => this.scheduleData.bind(this));
    }

    private createId(): string {
        const constructor = this.constructor as any;
        const className = constructor.className;
        if (!className) {
            throw new Error(`The ${constructor} is missing the 'className' property.`);
        }
        return className + '-' + (constructor.id = (constructor.id || 0) + 1);
    }

    abstract getDomainX(): any[];
    abstract getDomainY(): any[];

    abstract processData(): boolean;
    abstract update(): void;

    abstract getTooltipHtml(nodeDatum: SeriesNodeDatum): string;

    /**
     * @private
     * Populates the given {@param data} array with the items of this series
     * that should be shown in the legend. It's up to the series to determine
     * what is considered an item. An item could be the series itself or some
     * part of the series.
     * @param data
     */
    abstract listSeriesItems(data: LegendDatum[]): void;

    toggleSeriesItem(itemId: any, enabled: boolean): void {
        this.visible = enabled;
    }

    abstract highlightNode(node: Shape): void;
    abstract dehighlightNode(): void;

    scheduleLayout() {
        if (this.chart) {
            this.chart.layoutPending = true;
        }
    }

    scheduleData() {
        if (this.chart) {
            this.chart.dataPending = true;
        }
    }
}
