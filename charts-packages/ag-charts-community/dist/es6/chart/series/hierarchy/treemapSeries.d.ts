import { Label } from "../../label";
import { HighlightStyle, SeriesNodeDatum, SeriesTooltip, TooltipRendererParams } from "../series";
import { HierarchySeries } from "./hierarchySeries";
import { TooltipRendererResult } from "../../chart";
import { DropShadow } from "../../../scene/dropShadow";
import { ChartAxisDirection } from "../../chartAxis";
import { LegendDatum } from "../../legend";
interface TreemapNodeDatum extends SeriesNodeDatum {
    data: any;
    parent?: TreemapNodeDatum;
    children?: TreemapNodeDatum[];
    value: number;
    x0: number;
    x1: number;
    y0: number;
    y1: number;
    depth: number;
    series: TreemapSeries;
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
export declare class TreemapSeriesLabel extends Label {
    padding: number;
}
export declare class TreemapSeries extends HierarchySeries {
    static className: string;
    static type: string;
    private groupSelection;
    private labelMap;
    private layout;
    private dataRoot?;
    constructor();
    readonly title: TreemapSeriesLabel;
    readonly subtitle: TreemapSeriesLabel;
    readonly labels: {
        large: Label;
        medium: Label;
        small: Label;
        color: Label;
    };
    protected _nodePadding: number;
    nodePadding: number;
    labelKey: string;
    sizeKey?: string;
    colorKey?: string;
    colorDomain: number[];
    colorRange: string[];
    colorParents: boolean;
    gradient: boolean;
    colorName: string;
    rootName: string;
    protected _shadow: DropShadow;
    shadow: DropShadow;
    highlightStyle: HighlightStyle;
    readonly tooltip: TreemapSeriesTooltip;
    onHighlightChange(): void;
    private updateLayoutPadding;
    processData(): boolean;
    protected getLabelCenterX(datum: any): number;
    protected getLabelCenterY(datum: any): number;
    update(): void;
    updateNodes(): void;
    getDomain(direction: ChartAxisDirection): any[];
    getTooltipHtml(datum: TreemapNodeDatum): string;
    listSeriesItems(legendData: LegendDatum[]): void;
}
export {};
