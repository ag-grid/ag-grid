import { Group } from '../../../scene/group';
import { Selection } from '../../../scene/selection';
import { Rect } from '../../../scene/shape/rect';
import { Text } from '../../../scene/shape/text';
import { DropShadow } from '../../../scene/dropShadow';
import { SeriesNodeDatum, SeriesNodeDataContext, SeriesTooltip } from '../series';
import { Label } from '../../label';
import { LegendDatum } from '../../legendDatum';
import { CartesianSeries, CartesianSeriesNodeClickEvent } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { Point } from '../../../scene/point';
import { AgCartesianSeriesLabelFormatterParams, AgCartesianSeriesTooltipRendererParams, AgTooltipRendererResult, AgBarSeriesFormatterParams, AgBarSeriesFormat, AgBarSeriesLabelPlacement, FontStyle, FontWeight } from '../../agChartOptions';
interface BarNodeDatum extends SeriesNodeDatum, Readonly<Point> {
    readonly index: number;
    readonly yKey: string;
    readonly yValue: number;
    readonly width: number;
    readonly height: number;
    readonly fill?: string;
    readonly stroke?: string;
    readonly colorIndex: number;
    readonly strokeWidth: number;
    readonly label?: Readonly<Point> & {
        readonly text: string;
        readonly fontStyle?: FontStyle;
        readonly fontWeight?: FontWeight;
        readonly fontSize: number;
        readonly fontFamily: string;
        readonly textAlign: CanvasTextAlign;
        readonly textBaseline: CanvasTextBaseline;
        readonly fill: string;
    };
}
declare class BarSeriesLabel extends Label {
    formatter?: (params: AgCartesianSeriesLabelFormatterParams) => string;
    placement: AgBarSeriesLabelPlacement;
}
declare class BarSeriesTooltip extends SeriesTooltip {
    renderer?: (params: AgCartesianSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
}
export declare class BarSeries extends CartesianSeries<SeriesNodeDataContext<BarNodeDatum>, Rect> {
    static className: string;
    static type: "bar";
    private xData;
    private yData;
    private yDomain;
    readonly label: BarSeriesLabel;
    tooltip: BarSeriesTooltip;
    flipXY: boolean;
    fills: string[];
    strokes: string[];
    fillOpacity: number;
    strokeOpacity: number;
    lineDash?: number[];
    lineDashOffset: number;
    formatter?: (params: AgBarSeriesFormatterParams<any>) => AgBarSeriesFormat;
    constructor();
    /**
     * Used to get the position of bars within each group.
     */
    private groupScale;
    directionKeys: {
        x: string[];
        y: string[];
    };
    getKeys(direction: ChartAxisDirection): string[];
    protected _xKey: string;
    set xKey(value: string);
    get xKey(): string;
    xName: string;
    private cumYKeyCount;
    private flatYKeys;
    hideInLegend: string[];
    protected _yKeys: string[][];
    set yKeys(yKeys: string[][]);
    get yKeys(): string[][];
    protected _visibles: boolean[];
    set visibles(visibles: boolean[] | boolean[][]);
    get visibles(): boolean[] | boolean[][];
    private processSeriesItemEnabled;
    protected _grouped: boolean;
    set grouped(value: boolean);
    get grouped(): boolean;
    /**
     * A map of `yKeys` to their names (used in legends and tooltips).
     * For example, if a key is `product_name` it's name can be a more presentable `Product Name`.
     */
    protected _yNames: {
        [key in string]: string;
    };
    set yNames(values: {
        [key in string]: string;
    });
    get yNames(): {
        [key in string]: string;
    };
    /**
     * The value to normalize the bars to.
     * Should be a finite positive value or `undefined`.
     * Defaults to `undefined` - bars are not normalized.
     */
    private _normalizedTo?;
    set normalizedTo(value: number | undefined);
    get normalizedTo(): number | undefined;
    strokeWidth: number;
    shadow?: DropShadow;
    protected smallestDataInterval?: {
        x: number;
        y: number;
    };
    processData(): Promise<void>;
    findLargestMinMax(groups: {
        min?: number;
        max?: number;
    }[][]): {
        min: number;
        max: number;
    };
    getDomain(direction: ChartAxisDirection): any[];
    protected getNodeClickEvent(event: MouseEvent, datum: BarNodeDatum): CartesianSeriesNodeClickEvent<any>;
    private getCategoryAxis;
    private getValueAxis;
    private calculateStep;
    createNodeData(): Promise<SeriesNodeDataContext<BarNodeDatum, BarNodeDatum>[]>;
    protected updateDatumSelection(opts: {
        nodeData: BarNodeDatum[];
        datumSelection: Selection<Rect, Group, BarNodeDatum, any>;
    }): Promise<Selection<Rect, Group, BarNodeDatum, any>>;
    protected updateDatumNodes(opts: {
        datumSelection: Selection<Rect, Group, BarNodeDatum, any>;
        isHighlight: boolean;
    }): Promise<void>;
    protected updateLabelSelection(opts: {
        labelData: BarNodeDatum[];
        labelSelection: Selection<Text, Group, BarNodeDatum, any>;
    }): Promise<Selection<Text, Group, BarNodeDatum, any>>;
    protected updateLabelNodes(opts: {
        labelSelection: Selection<Text, Group, BarNodeDatum, any>;
    }): Promise<void>;
    getTooltipHtml(nodeDatum: BarNodeDatum): string;
    getLegendData(): LegendDatum[];
    toggleSeriesItem(itemId: string, enabled: boolean): void;
    protected isLabelEnabled(): boolean;
}
export {};
