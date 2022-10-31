import { Label } from '../../label';
import { SeriesNodeDatum, SeriesTooltip, TooltipRendererParams, SeriesNodeClickEvent } from '../series';
import { HierarchySeries } from './hierarchySeries';
import { TooltipRendererResult } from '../../tooltip/tooltip';
import { DropShadow } from '../../../scene/dropShadow';
import { ChartAxisDirection } from '../../chartAxis';
import { LegendDatum } from '../../legend';
interface TreemapNodeDatum extends SeriesNodeDatum {
    parent?: TreemapNodeDatum;
    children?: TreemapNodeDatum[];
    value: number;
    x0: number;
    x1: number;
    y0: number;
    y1: number;
    depth: number;
    fill: string;
    label: string;
    hasTitle: boolean;
    colorValue: number;
}
export interface TreemapTooltipRendererParams extends TooltipRendererParams {
    datum: TreemapNodeDatum;
    labelKey: string;
    sizeKey?: string;
    colorKey?: string;
}
export declare class TreemapSeriesTooltip extends SeriesTooltip {
    renderer?: (params: TreemapTooltipRendererParams) => string | TooltipRendererResult;
}
export declare class TreemapSeriesNodeClickEvent extends SeriesNodeClickEvent<any> {
    readonly labelKey: string;
    readonly sizeKey?: string;
    readonly colorKey?: string;
    constructor(labelKey: string, sizeKey: string | undefined, colorKey: string | undefined, nativeEvent: MouseEvent, datum: TreemapNodeDatum, series: TreemapSeries);
}
export declare class TreemapSeriesLabel extends Label {
    padding: number;
}
export interface TreemapSeriesFormatterParams {
    readonly datum: any;
    readonly labelKey: string;
    readonly sizeKey?: string;
    readonly colorKey?: string;
    readonly fill?: string;
    readonly fillOpacity?: string;
    readonly stroke?: string;
    readonly strokeOpacity?: number;
    readonly strokeWidth?: number;
    readonly gradient?: boolean;
    readonly highlighted: boolean;
}
export interface TreemapSeriesFormat {
    fill?: string;
    fillOpacity?: number;
    stroke?: string;
    strokeOpacity?: number;
    strokeWidth?: number;
    gradient?: boolean;
}
export declare class TreemapSeries extends HierarchySeries<TreemapNodeDatum> {
    static className: string;
    static type: "treemap";
    private groupSelection;
    private highlightSelection;
    private layout;
    private dataRoot?;
    readonly title: TreemapSeriesLabel;
    readonly subtitle: TreemapSeriesLabel;
    readonly labels: {
        large: Label;
        medium: Label;
        small: Label;
        color: Label;
    };
    protected _nodePadding: number;
    set nodePadding(value: number);
    get nodePadding(): number;
    labelKey: string;
    sizeKey?: string;
    colorKey?: string;
    colorDomain: number[];
    colorRange: string[];
    colorParents: boolean;
    gradient: boolean;
    formatter?: (params: TreemapSeriesFormatterParams) => TreemapSeriesFormat;
    colorName: string;
    rootName: string;
    shadow: DropShadow;
    readonly tooltip: TreemapSeriesTooltip;
    private updateLayoutPadding;
    processData(): Promise<void>;
    protected getLabelCenterX(datum: any): number;
    protected getLabelCenterY(datum: any): number;
    createNodeData(): Promise<never[]>;
    update(): Promise<void>;
    updateSelections(): Promise<void>;
    updateNodes(): Promise<void>;
    buildLabelMeta(data: TreemapNodeDatum[]): ({
        label: Label;
        nodeBaseline?: "top" | "hanging" | "middle" | "alphabetic" | "ideographic" | "bottom" | undefined;
        valueBaseline?: "top" | "hanging" | "middle" | "alphabetic" | "ideographic" | "bottom" | undefined;
        valueText?: string | undefined;
    } | undefined)[];
    getDomain(_direction: ChartAxisDirection): any[];
    protected getNodeClickEvent(event: MouseEvent, datum: TreemapNodeDatum): TreemapSeriesNodeClickEvent;
    getTooltipHtml(nodeDatum: TreemapNodeDatum): string;
    getLegendData(): LegendDatum[];
}
export {};
