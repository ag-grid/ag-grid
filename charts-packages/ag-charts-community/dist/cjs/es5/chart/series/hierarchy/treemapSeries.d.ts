import { Label } from '../../label';
import { SeriesNodeDatum, SeriesTooltip, SeriesNodeClickEvent, HighlightStyle } from '../series';
import { HierarchySeries } from './hierarchySeries';
import { DropShadow } from '../../../scene/dropShadow';
import { ChartAxisDirection } from '../../chartAxis';
import { LegendDatum } from '../../legend';
import { BBox } from '../../../scene/bbox';
import { AgTreemapSeriesTooltipRendererParams, AgTooltipRendererResult, AgTreemapSeriesFormatterParams, AgTreemapSeriesFormat } from '../../agChartOptions';
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
declare class TreemapSeriesNodeClickEvent extends SeriesNodeClickEvent<any> {
    readonly labelKey: string;
    readonly sizeKey?: string;
    readonly colorKey?: string;
    constructor(labelKey: string, sizeKey: string | undefined, colorKey: string | undefined, nativeEvent: MouseEvent, datum: TreemapNodeDatum, series: TreemapSeries);
}
declare class TreemapSeriesLabel extends Label {
    padding: number;
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
export declare class TreemapHighlightStyle extends HighlightStyle {
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
        large: Label;
        medium: Label;
        small: Label;
        value: TreemapValueLabel;
    };
    nodePadding: number;
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
    processData(): Promise<void>;
    createNodeData(): Promise<never[]>;
    update(): Promise<void>;
    updateSelections(): Promise<void>;
    private isDatumHighlighted;
    private getTileFormat;
    updateNodes(): Promise<void>;
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
    getTooltipHtml(nodeDatum: TreemapNodeDatum): string;
    getLegendData(): LegendDatum[];
}
export {};
