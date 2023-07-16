import { Label } from '../../label';
import type { SeriesNodeDatum } from '../series';
import { SeriesTooltip, HighlightStyle, SeriesNodeBaseClickEvent } from '../series';
import { HierarchySeries } from './hierarchySeries';
import { DropShadow } from '../../../scene/dropShadow';
import type { ChartAxisDirection } from '../../chartAxisDirection';
import type { ChartLegendDatum } from '../../legendDatum';
import { BBox } from '../../../scene/bbox';
import type { AgTreemapSeriesTooltipRendererParams, AgTooltipRendererResult, AgTreemapSeriesFormatterParams, AgTreemapSeriesFormat, TextWrap } from '../../agChartOptions';
declare type TreeDatum = {
    [prop: string]: any;
    children?: TreeDatum[];
};
interface TreemapNodeDatum extends SeriesNodeDatum {
    datum: TreeDatum;
    value: number;
    depth: number;
    label: string;
    fill: string;
    parent?: TreemapNodeDatum;
    isLeaf: boolean;
    children: TreemapNodeDatum[];
}
declare class TreemapSeriesTooltip extends SeriesTooltip {
    renderer?: (params: AgTreemapSeriesTooltipRendererParams<any>) => string | AgTooltipRendererResult;
}
declare class TreemapSeriesNodeBaseClickEvent extends SeriesNodeBaseClickEvent<any> {
    readonly labelKey: string;
    readonly sizeKey?: string;
    readonly colorKey?: string;
    constructor(labelKey: string, sizeKey: string | undefined, colorKey: string | undefined, nativeEvent: MouseEvent, datum: TreemapNodeDatum, series: TreemapSeries);
}
declare class TreemapSeriesNodeClickEvent extends TreemapSeriesNodeBaseClickEvent {
    readonly type = "nodeClick";
}
declare class TreemapSeriesNodeDoubleClickEvent extends TreemapSeriesNodeBaseClickEvent {
    readonly type = "nodeDoubleClick";
}
declare class TreemapSeriesLabel extends Label {
    padding: number;
}
declare class TreemapSeriesTileLabel extends Label {
    wrapping: TextWrap;
}
declare class TreemapValueLabel {
    key?: string;
    name?: string;
    formatter?: (params: {
        datum: any;
    }) => string | undefined;
    style: Label;
}
declare class TreemapTextHighlightStyle {
    color?: string;
}
declare class TreemapHighlightStyle extends HighlightStyle {
    readonly text: TreemapTextHighlightStyle;
}
export declare class TreemapSeries extends HierarchySeries<TreemapNodeDatum> {
    static className: string;
    static type: "treemap";
    private groupSelection;
    private highlightSelection;
    private dataRoot?;
    readonly title: TreemapSeriesLabel;
    readonly subtitle: TreemapSeriesLabel;
    readonly labels: {
        large: TreemapSeriesTileLabel;
        medium: TreemapSeriesTileLabel;
        small: TreemapSeriesTileLabel;
        formatter: ((params: import("../../agChartOptions").AgTreemapSeriesLabelFormatterParams<any>) => string) | undefined;
        value: TreemapValueLabel;
    };
    nodePadding: number;
    nodeGap: number;
    labelKey: string;
    sizeKey?: string;
    colorKey?: string;
    colorDomain: number[];
    colorRange: string[];
    groupFill: string;
    groupStroke: string;
    groupStrokeWidth: number;
    tileStroke: string;
    tileStrokeWidth: number;
    gradient: boolean;
    formatter?: (params: AgTreemapSeriesFormatterParams) => AgTreemapSeriesFormat;
    colorName: string;
    rootName: string;
    highlightGroups: boolean;
    tileShadow: DropShadow;
    labelShadow: DropShadow;
    readonly tooltip: TreemapSeriesTooltip;
    readonly highlightStyle: TreemapHighlightStyle;
    private getNodePaddingTop;
    private getNodePadding;
    /**
     * Squarified Treemap algorithm
     * https://www.win.tue.nl/~vanwijk/stm.pdf
     */
    private squarify;
    private applyGap;
    processData(): Promise<void>;
    createNodeData(): Promise<never[]>;
    update(): Promise<void>;
    updateSelections(): Promise<void>;
    private isDatumHighlighted;
    private getTileFormat;
    updateNodes(): Promise<void>;
    private updateNodeMidPoint;
    private getHighlightedSubtree;
    buildLabelMeta(boxes: Map<TreemapNodeDatum, BBox>): Map<TreemapNodeDatum, {
        label?: {
            text: string;
            style: Label;
            x: number;
            y: number;
            hAlign: CanvasTextAlign;
            vAlign: CanvasTextBaseline;
        } | undefined;
        value?: {
            text: string;
            style: Label;
            x: number;
            y: number;
            hAlign: CanvasTextAlign;
            vAlign: CanvasTextBaseline;
        } | undefined;
    }>;
    getDomain(_direction: ChartAxisDirection): any[];
    protected getNodeClickEvent(event: MouseEvent, datum: TreemapNodeDatum): TreemapSeriesNodeClickEvent;
    protected getNodeDoubleClickEvent(event: MouseEvent, datum: TreemapNodeDatum): TreemapSeriesNodeDoubleClickEvent;
    getTooltipHtml(nodeDatum: TreemapNodeDatum): string;
    getLegendData(): ChartLegendDatum[];
}
export {};
//# sourceMappingURL=treemapSeries.d.ts.map