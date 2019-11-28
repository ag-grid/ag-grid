import { Group } from "../../scene/group";
import { LegendDatum } from "../legend";
import { Shape } from "../../scene/shape/shape";
import { Observable, reactive } from "../../util/observable";
import { ChartAxis, ChartAxisDirection } from "../chartAxis";
import { Chart } from "../chart";

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

export abstract class Series extends Observable {

    readonly id: string = this.createId();

    /**
     * The group node that contains all the nodes used to render this series.
     */
    readonly group: Group = new Group();

    chart?: Chart;
    xAxis: ChartAxis;
    yAxis: ChartAxis;

    directions: ChartAxisDirection[] = [ChartAxisDirection.X, ChartAxisDirection.Y];
    directionKeys: { [key in ChartAxisDirection]?: string[] };

    tooltipEnabled: boolean = false;

    @reactive(['dataChange']) data: any[] = [];
    @reactive(['dataChange']) visible = true;
    @reactive(['layoutChange']) showInLegend = true;

    /**
     * Returns the actual keys used (to fetch the values from `data` items) for the given direction.
     */
    getKeys(direction: ChartAxisDirection): string[] {
        const { directionKeys } = this;
        const keys = directionKeys && directionKeys[direction];
        const values: string[] = [];

        if (keys) {
            keys.forEach(key => {
                const value = (this as any)[key];

                if (value) {
                    if (Array.isArray(value)) {
                        values.push(...value);
                    } else {
                        values.push(value);
                    }
                }
            });
        }

        return values;
    }

    private createId(): string {
        const constructor = this.constructor as any;
        const className = constructor.className;

        if (!className) {
            throw new Error(`The ${constructor} is missing the 'className' property.`);
        }

        return className + '-' + (constructor.id = (constructor.id || 0) + 1);
    }

    abstract getDomain(direction: ChartAxisDirection): any[];

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

    readonly scheduleLayout = () => {
        this.fireEvent({ type: 'layoutChange' });
    }

    readonly scheduleData = () => {
        this.fireEvent({ type: 'dataChange' });
    }

    protected fixNumericExtent(extent?: [number, number], type?: string): [number, number] {
        if (!extent) {
            if (type) {
                console.warn(`The ${type}-domain could not be found (no valid values), using the default of [0, 1].`);
            }
            return [0, 1];
        }

        let [min, max] = extent;

        if (min === max) {
            min -= 1;
            max += 1;
            if (type) {
                console.warn(`The ${type}-domain has zero length and has been automatically expanded`
                    + ` by 1 in each direction (from the single valid ${type}-value: ${min}).`);
            }
        }

        if (!isFinite(min) || !isFinite(max)) {
            min = 0;
            max = 1;
            if (type) {
                console.warn(`The ${type}-domain has infinite length, using the default of [0, 1].`);
            }
        }

        return [min, max];
    }
}
