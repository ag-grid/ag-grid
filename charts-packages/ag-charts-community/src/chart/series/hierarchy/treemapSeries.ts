import { Selection } from "../../../scene/selection";
import { HdpiCanvas } from "../../../canvas/hdpiCanvas";
import { reactive } from "../../../util/observable";
import { Label } from "../../label";
import { HighlightStyle, SeriesNodeDatum, SeriesTooltip } from "../series";
import { HierarchySeries } from "./hierarchySeries";
import * as d3 from "d3";
import { TooltipRendererResult, toTooltipHtml } from "../../chart";
import { Group } from "../../../scene/group";
import { Text } from "../../../scene/shape/text";
import { Rect } from "../../../scene/shape/rect";
import { DropShadow } from "../../../scene/dropShadow";
import { LinearScale } from "../../../scale/linearScale";
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
    $value: number;
}

export interface TreemapTooltipRendererParams {
    datum: TreemapNodeDatum;
    labelKey: string;
    sizeKey?: string;
    valueKey?: string;
    color: string;
}

export class TreemapSeriesTooltip extends SeriesTooltip {
    @reactive('change') renderer?: (params: TreemapTooltipRendererParams) => string | TooltipRendererResult;
}

export class TreemapSeriesLabel extends Label {
    @reactive('change') padding = 10;
}

enum TextNodeTag {
    Label,
    Value
}

export class TreemapSeries extends HierarchySeries {

    static className = 'TreemapSeries';
    static type = 'treemap';

    private groupSelection: Selection<Group, Group, TreemapNodeDatum, any> = Selection.select(this.group).selectAll<Group>();

    private colorMap = new Map<Rect, string>();
    private tickerMap = new Map<string, Text | undefined>();
    private layout = d3.treemap().round(true);
    private dataRoot?: d3.HierarchyNode<any>;

    constructor() {
        super();

        this.shadow.addEventListener('change', this.update, this);
        this.title.addEventListener('change', this.update, this);
        this.subtitle.addEventListener('change', this.update, this);
        this.labels.small.addEventListener('change', this.update, this);
        this.labels.medium.addEventListener('change', this.update, this);
        this.labels.large.addEventListener('change', this.update, this);
        this.labels.value.addEventListener('change', this.update, this);
    }

    readonly title: TreemapSeriesLabel = (() => {
        const label = new TreemapSeriesLabel();
        label.fontWeight = 'bold';
        label.fontSize = 12;
        label.fontFamily = 'Verdana, sans-serif';
        label.padding = 15;
        return label;
    })();

    readonly subtitle: TreemapSeriesLabel = (() => {
        const label = new TreemapSeriesLabel();
        label.fontSize = 9;
        label.fontFamily = 'Verdana, sans-serif';
        label.padding = 13;
        return label;
    })();

    readonly labels = {
        large: (() => {
            const label = new Label();
            label.fontWeight = 'bold';
            label.fontSize = 18;
            return label;
        })(),
        medium: (() => {
            const label = new Label();
            label.fontWeight = 'bold';
            label.fontSize = 14;
            return label;
        })(),
        small: (() => {
            const label = new Label();
            label.fontWeight = 'bold';
            label.fontSize = 10;
            return label;
        })(),
        value: (() => {
            const label = new Label();
            label.color = 'white';
            return label;
        })()
    }

    protected _nodePadding = 2;
    set nodePadding(value: number) {
        if (this._nodePadding !== value) {
            this._nodePadding = value;
            this.updateLayoutPadding();
            this.update();
        }
    }
    get nodePadding(): number {
        return this._nodePadding;
    }

    @reactive('dataChange') labelKey: string = 'label';
    @reactive('dataChange') sizeKey?: string = 'size';
    @reactive('dataChange') valueKey?: string = 'value';
    @reactive('dataChange') valueDomain: number[] = [-5, 5];
    @reactive('dataChange') valueRange: string[] = ['#cb4b3f', '#6acb64'];
    @reactive('dataChange') colorParents: boolean = false;
    @reactive('update') gradient: boolean = true;

    valueName: string = 'Value';
    rootName: string = 'Root';

    protected _shadow: DropShadow = (() => {
        const shadow = new DropShadow();
        shadow.color = 'rgba(0, 0, 0, 0.4)';
        shadow.xOffset = 1.5;
        shadow.yOffset = 1.5;
        return shadow;
    })();
    set shadow(value: DropShadow) {
        if (this._shadow !== value) {
            this._shadow = value;
            this.update();
        }
    }
    get shadow(): DropShadow {
        return this._shadow;
    }

    highlightStyle: HighlightStyle = { fill: 'yellow' };

    readonly tooltip = new TreemapSeriesTooltip();

    onHighlightChange() {
        this.updateNodes();
    }

    private updateLayoutPadding() {
        const { title, subtitle, nodePadding, labelKey } = this;

        this.layout
            .paddingRight(nodePadding)
            .paddingBottom(nodePadding)
            .paddingLeft(nodePadding)
            .paddingTop(node => {
                let name = (node.data as any)[labelKey] || '';
                if (node.children) {
                    name = name.toUpperCase();
                }
                const font = node.depth > 1 ? subtitle : title;
                const textSize = HdpiCanvas.getTextSize(
                    name, [font.fontWeight, font.fontSize + 'px', font.fontFamily].join(' ').trim()
                );
                const innerNodeWidth = node.x1 - node.x0 - nodePadding * 2;
                const hasTitle = node.depth > 0 && node.children && textSize.width <= innerNodeWidth;
                (node as any).hasTitle = hasTitle;

                return hasTitle ? textSize.height + nodePadding * 2 : nodePadding;
            });
    }

    processData(): boolean {
        const { data, sizeKey, labelKey, valueKey, valueDomain, valueRange, colorParents } = this;

        if (sizeKey) {
            this.dataRoot = d3.hierarchy(data).sum(datum => datum.children ? 1 : datum[sizeKey]);
        } else {
            this.dataRoot = d3.hierarchy(data).sum(datum => datum.children ? 0 : 1);
        }

        const colorScale = new LinearScale();
        colorScale.domain = valueDomain;
        colorScale.range = valueRange;

        const series = this;
        function traverse(root: any, depth = 0) {
            const { children, data } = root;
            const label = data[labelKey];
            const value = valueKey ? data[valueKey] : depth;

            root.series = series;
            root.fill = !children || colorParents ? colorScale.convert(value) : '#272931';
            root.$value = value;

            if (label) {
                root.label = children ? label.toUpperCase() : label;
            } else {
                root.label = '';
            }

            if (children) {
                children.forEach((child: any) => traverse(child, depth + 1));
            }
        }
        traverse(this.dataRoot);

        return true;
    }

    protected getLabelCenterX(datum: any): number {
        return (datum.x0 + datum.x1) / 2;
    }

    protected getLabelCenterY(datum: any): number {
        return (datum.y0 + datum.y1) / 2 + 2;
    }

    update(): void {
        const { chart, dataRoot } = this;

        if (!chart || !dataRoot) {
            return;
        }

        const seriesRect = chart.getSeriesRect();

        if (!seriesRect) {
            return;
        }

        this.layout = this.layout.size([seriesRect.width, seriesRect.height]).round(true);
        this.updateLayoutPadding();

        const descendants = this.layout(dataRoot).descendants();

        const updateGroups = this.groupSelection.setData(descendants);
        updateGroups.exit.remove();

        const enterGroups = updateGroups.enter.append(Group);
        enterGroups.append(Rect);
        enterGroups.append(Text).each((node: any) => node.tag = TextNodeTag.Label);
        enterGroups.append(Text).each((node: any) => node.tag = TextNodeTag.Value);

        this.groupSelection = updateGroups.merge(enterGroups) as any;

        this.updateNodes();
    }

    updateNodes() {
        const { chart } = this;

        if (!chart) {
            return;
        }

        const { highlightedDatum } = chart;
        const { fill: highlightFill, stroke: highlightStroke } = this.highlightStyle;
        const { tickerMap, nodePadding, title, subtitle, labels, shadow, gradient } = this;

        this.groupSelection.selectByClass(Rect).each((rect, datum) => {
            const highlighted = datum === highlightedDatum;
            const fill = highlighted && highlightFill !== undefined ? highlightFill : datum.fill;
            const stroke = highlighted && highlightStroke !== undefined ? highlightStroke : datum.depth < 2 ? undefined : 'black';

            // let fill = colorMap.get(rect);
            // if (!fill) {
            //     fill = isParent ? '#272931' : colorInterpolator(colorScale.convert(-5 + Math.random() * 10));
            //     colorMap.set(rect, fill);
            // }

            rect.fill = fill;
            rect.stroke = stroke;
            rect.strokeWidth = 1;
            rect.crisp = true;
            rect.gradient = gradient;

            rect.x = datum.x0;
            rect.y = datum.y0;
            rect.width = datum.x1 - datum.x0;
            rect.height = datum.y1 - datum.y0;
        });

        this.groupSelection.selectByTag<Text>(TextNodeTag.Label).each((text, datum, index) => {
            const isLeaf = !datum.children;
            const innerNodeWidth = datum.x1 - datum.x0 - nodePadding * 2;
            const innerNodeHeight = datum.y1 - datum.y0 - nodePadding * 2;
            const hasTitle = datum.hasTitle;
            const isParent = !!datum.children;
            const name = datum.data.name;
            const highlighted = datum === highlightedDatum;

            let label;
            if (isLeaf) {
                if (innerNodeHeight > 40 && innerNodeWidth > 40) {
                    label = labels.large;
                } else if (innerNodeHeight > 20 && innerNodeHeight > 20) {
                    label = labels.medium;
                } else {
                    label = labels.small;
                }
            } else {
                if (datum.depth > 1) {
                    label = subtitle;
                } else {
                    label = title;
                }
            }

            text.fontWeight = label.fontWeight;
            text.fontSize = label.fontSize;
            text.fontFamily = label.fontFamily;
            text.textBaseline = isLeaf ? 'bottom' : (hasTitle ? 'top' : 'middle');
            text.textAlign = hasTitle ? 'left' : 'center';
            text.text = datum.label;

            const textBBox = text.computeBBox();

            const hasLabel = isLeaf && textBBox
                && textBBox.width <= innerNodeWidth
                && textBBox.height * 2 + 8 <= innerNodeHeight;

            tickerMap.set(name, hasLabel ? text : undefined);

            text.fill = highlighted ? 'black' : 'white';
            text.fillShadow = hasLabel && !highlighted ? shadow : undefined;
            text.visible = hasTitle || !!hasLabel;

            if (hasTitle) {
                text.x = datum.x0 + nodePadding;
                text.y = datum.y0 + nodePadding;
            } else {
                text.x = this.getLabelCenterX(datum);
                text.y = this.getLabelCenterY(datum);
            }
        });

        this.groupSelection.selectByTag<Text>(TextNodeTag.Value).each((text, datum) => {
            const isLeaf = !datum.children;
            const innerNodeWidth = datum.x1 - datum.x0 - nodePadding * 2;
            const highlighted = datum === highlightedDatum;
            const value = datum.$value;
            const label = labels.value;
            // const innerNodeHeight = datum.y1 - datum.y0 - nodePadding * 2;
            // const font = innerNodeHeight > 40 && innerNodeWidth > 40 ? fonts.label.big : innerNodeHeight > 20  && innerNodeHeight > 20 ? fonts.label.medium : fonts.label.small

            text.fontSize = label.fontSize;
            text.fontFamily = label.fontFamily;
            text.fontStyle = label.fontStyle;
            text.fontWeight = label.fontWeight;
            text.textBaseline = 'top';
            text.textAlign = 'center';
            text.text = typeof value === 'number' && isFinite(value)
                ? String(datum.$value.toFixed(2)) + '%'
                : '';

            const textBBox = text.computeBBox();
            const tickerNode = tickerMap.get(datum.data.name);
            const hasLabel = !!tickerNode || false;
            const isVisible = hasLabel && !!textBBox && textBBox.width < innerNodeWidth;

            text.fill = highlighted ? 'black' : label.color;
            text.fillShadow = highlighted ? undefined : shadow;

            text.visible = isVisible;
            if (isVisible) {
                text.x = this.getLabelCenterX(datum);
                text.y = this.getLabelCenterY(datum);
            } else {
                if (tickerNode) {
                    tickerNode.textBaseline = 'middle';
                    tickerNode.y = this.getLabelCenterY(datum);
                }
            }
        });
    }

    getDomain(direction: ChartAxisDirection): any[] {
        return [0, 1];
    }

    getTooltipHtml(datum: TreemapNodeDatum): string {
        const { tooltip, sizeKey, labelKey, valueKey, valueName, rootName } = this;
        const { data } = datum;
        const { renderer: tooltipRenderer } = tooltip;

        const title: string | undefined = datum.depth ? data[labelKey] : (rootName || data[labelKey]);
        let content: string | undefined = undefined;
        const color = datum.fill || 'gray';

        if (valueKey && valueName) {
            const value = data[valueKey];
            if (typeof value === 'number' && isFinite(value)) {
                content = `<b>${valueName}</b>: ${data[valueKey].toFixed(2)}`;
            }
        }

        const defaults: TooltipRendererResult = {
            title,
            backgroundColor: color,
            content
        };

        if (tooltipRenderer) {
            return toTooltipHtml(tooltipRenderer({
                datum,
                sizeKey,
                labelKey,
                valueKey,
                color
            }), defaults);
        }

        return toTooltipHtml(defaults);
    }

    listSeriesItems(legendData: LegendDatum[]): void {
    }
}