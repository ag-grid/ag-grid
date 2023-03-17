import { Selection } from '../../../scene/selection';
import { Rect } from '../../../scene/shape/rect';
import { Text } from '../../../scene/shape/text';
import { DropShadow } from '../../../scene/dropShadow';
import { SeriesNodeDatum, SeriesNodeDataContext, SeriesTooltip } from '../series';
import { Label } from '../../label';
import { LegendDatum } from '../../legendDatum';
import { CartesianSeries, CartesianSeriesNodeClickEvent, CartesianSeriesNodeDoubleClickEvent } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { Point } from '../../../scene/point';
import { AgCartesianSeriesLabelFormatterParams, AgTooltipRendererResult, AgBarSeriesFormatterParams, AgBarSeriesTooltipRendererParams, AgBarSeriesFormat, AgBarSeriesLabelPlacement, FontStyle, FontWeight } from '../../agChartOptions';
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
    renderer?: (params: AgBarSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
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
    protected resolveKeyDirection(direction: ChartAxisDirection): ChartAxisDirection;
    protected _xKey: string;
    set xKey(value: string);
    get xKey(): string;
    xName: string;
    private cumYKeyCount;
    private flatYKeys;
    hideInLegend: string[];
    yKeys: string[][];
    protected yKeysCache: string[][];
    protected processYKeys(): void;
    visibles: boolean[];
    private processSeriesItemEnabled;
    protected _grouped: boolean;
    set grouped(value: boolean);
    get grouped(): boolean;
    stackGroups: Record<string, string[]>;
    protected getStackGroup(yKey: string): string | undefined;
    /**
     * A map of `yKeys` to their names (used in legends and tooltips).
     * For example, if a key is `product_name` it's name can be a more presentable `Product Name`.
     */
    yNames: {
        [key in string]: string;
    };
    protected processYNames(): void;
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
    protected getNodeDoubleClickEvent(event: MouseEvent, datum: BarNodeDatum): CartesianSeriesNodeDoubleClickEvent<any>;
    private getCategoryAxis;
    private getValueAxis;
    private calculateStep;
    createNodeData(): Promise<SeriesNodeDataContext<BarNodeDatum, BarNodeDatum>[]>;
    protected nodeFactory(): Rect;
    protected updateDatumSelection(opts: {
        nodeData: BarNodeDatum[];
        datumSelection: Selection<Rect, BarNodeDatum>;
    }): Promise<Selection<Rect, BarNodeDatum>>;
    protected updateDatumNodes(opts: {
        datumSelection: Selection<Rect, BarNodeDatum>;
        isHighlight: boolean;
    }): Promise<void>;
    protected updateLabelSelection(opts: {
        labelData: BarNodeDatum[];
        labelSelection: Selection<Text, BarNodeDatum>;
    }): Promise<Selection<Text, BarNodeDatum>>;
    protected updateLabelNodes(opts: {
        labelSelection: Selection<Text, BarNodeDatum>;
    }): Promise<void>;
    getTooltipHtml(nodeDatum: BarNodeDatum): string;
    getLegendData(): LegendDatum[];
    toggleSeriesItem(itemId: string, enabled: boolean): void;
    protected isLabelEnabled(): boolean;
}
export {};
