import { TypedEvent } from '../../../util/observable';
import { Label } from '../../label';
import { SeriesNodeDatum, SeriesTooltip, TooltipRendererParams } from '../series';
import { HierarchySeries } from './hierarchySeries';
import { TooltipRendererResult } from '../../chart';
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
export interface TreemapSeriesNodeClickEvent extends TypedEvent {
    readonly type: 'nodeClick';
    readonly event: MouseEvent;
    readonly series: TreemapSeries;
    readonly datum: any;
    readonly labelKey: string;
    readonly sizeKey?: string;
    readonly colorKey?: string;
}
export declare class TreemapSeriesLabel extends Label {
    padding: number;
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
    colorName: string;
    rootName: string;
    shadow: DropShadow;
    readonly tooltip: TreemapSeriesTooltip;
    private updateLayoutPadding;
    processData(): boolean;
    protected getLabelCenterX(datum: any): number;
    protected getLabelCenterY(datum: any): number;
    createNodeData(): never[];
    update(): void;
    updateSelections(): void;
    updateNodes(): void;
    buildLabelMeta(data: TreemapNodeDatum[]): ({
        label: Label;
        nodeBaseline?: "top" | "hanging" | "middle" | "alphabetic" | "ideographic" | "bottom" | undefined;
        valueBaseline?: "top" | "hanging" | "middle" | "alphabetic" | "ideographic" | "bottom" | undefined;
        valueText?: string | undefined;
    } | undefined)[];
    getDomain(_direction: ChartAxisDirection): any[];
    fireNodeClickEvent(event: MouseEvent, datum: TreemapNodeDatum): void;
    getTooltipHtml(nodeDatum: TreemapNodeDatum): string;
    listSeriesItems(_legendData: LegendDatum[]): void;
}
export {};
