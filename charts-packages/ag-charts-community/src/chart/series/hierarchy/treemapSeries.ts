import { Selection } from '../../../scene/selection';
import { HdpiCanvas } from '../../../canvas/hdpiCanvas';
import { Label } from '../../label';
import { SeriesNodeDatum, SeriesTooltip, SeriesNodeClickEvent, HighlightStyle } from '../series';
import { HierarchySeries } from './hierarchySeries';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { Group } from '../../../scene/group';
import { Text } from '../../../scene/shape/text';
import { Rect } from '../../../scene/shape/rect';
import { DropShadow } from '../../../scene/dropShadow';
import { ColorScale } from '../../../scale/colorScale';
import { ChartAxisDirection } from '../../chartAxis';
import { LegendDatum } from '../../legend';
import { toFixed } from '../../../util/number';
import { Path2D } from '../../../scene/path2D';
import { BBox } from '../../../scene/bbox';
import {
    BOOLEAN,
    NUMBER,
    NUMBER_ARRAY,
    OPT_BOOLEAN,
    OPT_COLOR_STRING,
    OPT_FUNCTION,
    OPT_NUMBER,
    OPT_STRING,
    STRING,
    COLOR_STRING_ARRAY,
    Validate,
} from '../../../util/validation';
import {
    AgTreemapSeriesTooltipRendererParams,
    AgTooltipRendererResult,
    AgTreemapSeriesFormatterParams,
    AgTreemapSeriesFormat,
} from '../../agChartOptions';

type TreeDatum = {
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

class TreemapSeriesTooltip extends SeriesTooltip {
    @Validate(OPT_FUNCTION)
    renderer?: (params: AgTreemapSeriesTooltipRendererParams<any>) => string | AgTooltipRendererResult = undefined;
}

class TreemapSeriesNodeClickEvent extends SeriesNodeClickEvent<any> {
    readonly labelKey: string;
    readonly sizeKey?: string;
    readonly colorKey?: string;

    constructor(
        labelKey: string,
        sizeKey: string | undefined,
        colorKey: string | undefined,
        nativeEvent: MouseEvent,
        datum: TreemapNodeDatum,
        series: TreemapSeries
    ) {
        super(nativeEvent, datum, series);
        this.labelKey = labelKey;
        this.sizeKey = sizeKey;
        this.colorKey = colorKey;
    }
}

class TreemapSeriesLabel extends Label {
    @Validate(NUMBER(0))
    padding = 10;
}

class TreemapValueLabel {
    @Validate(OPT_STRING)
    key?: string;

    @Validate(OPT_STRING)
    name?: string;

    @Validate(OPT_FUNCTION)
    formatter?: (params: { datum: any }) => string | undefined;

    style = (() => {
        const label = new Label();
        label.color = 'white';
        return label;
    })();
}

enum TextNodeTag {
    Name,
    Value,
}

function getTextSize(text: string, style: Label) {
    return HdpiCanvas.getTextSize(text, [style.fontWeight, `${style.fontSize}px`, style.fontFamily].join(' '));
}

class TreemapTextHighlightStyle {
    @Validate(OPT_COLOR_STRING)
    color?: string = 'black';
}

export class TreemapHighlightStyle extends HighlightStyle {
    readonly text = new TreemapTextHighlightStyle();
}

export class TreemapSeries extends HierarchySeries<TreemapNodeDatum> {
    static className = 'TreemapSeries';
    static type = 'treemap' as const;

    private groupSelection: Selection<Group, Group, TreemapNodeDatum, any> = Selection.select(
        this.contentGroup
    ).selectAll<Group>();
    private highlightSelection: Selection<Group, Group, TreemapNodeDatum, any> = Selection.select(
        this.highlightGroup
    ).selectAll<Group>();

    private dataRoot?: TreemapNodeDatum;

    readonly title: TreemapSeriesLabel = (() => {
        const label = new TreemapSeriesLabel();
        label.color = 'white';
        label.fontWeight = 'bold';
        label.fontSize = 12;
        label.fontFamily = 'Verdana, sans-serif';
        label.padding = 15;
        return label;
    })();

    readonly subtitle: TreemapSeriesLabel = (() => {
        const label = new TreemapSeriesLabel();
        label.color = 'white';
        label.fontSize = 9;
        label.fontFamily = 'Verdana, sans-serif';
        label.padding = 13;
        return label;
    })();

    readonly labels = {
        large: (() => {
            const label = new Label();
            label.color = 'white';
            label.fontWeight = 'bold';
            label.fontSize = 18;
            return label;
        })(),
        medium: (() => {
            const label = new Label();
            label.color = 'white';
            label.fontWeight = 'bold';
            label.fontSize = 14;
            return label;
        })(),
        small: (() => {
            const label = new Label();
            label.color = 'white';
            label.fontWeight = 'bold';
            label.fontSize = 10;
            return label;
        })(),
        value: new TreemapValueLabel(),
    };

    @Validate(NUMBER(0))
    nodePadding = 2;

    @Validate(STRING)
    labelKey: string = 'label';

    @Validate(OPT_STRING)
    sizeKey?: string = 'size';

    @Validate(OPT_STRING)
    colorKey?: string = 'color';

    @Validate(NUMBER_ARRAY)
    colorDomain: number[] = [-5, 5];

    @Validate(COLOR_STRING_ARRAY)
    colorRange: string[] = ['#cb4b3f', '#6acb64'];

    @Validate(OPT_STRING)
    groupFill: string = '#272931';

    @Validate(OPT_COLOR_STRING)
    groupStroke: string = 'black';

    @Validate(OPT_NUMBER(0))
    groupStrokeWidth: number = 1;

    @Validate(OPT_COLOR_STRING)
    tileStroke: string = 'black';

    @Validate(OPT_NUMBER(0))
    tileStrokeWidth: number = 1;

    @Validate(BOOLEAN)
    gradient: boolean = true;

    @Validate(OPT_FUNCTION)
    formatter?: (params: AgTreemapSeriesFormatterParams) => AgTreemapSeriesFormat = undefined;

    @Validate(STRING)
    colorName: string = 'Change';

    @Validate(STRING)
    rootName: string = 'Root';

    @Validate(OPT_BOOLEAN)
    highlightGroups: boolean = true;

    tileShadow = new DropShadow();

    labelShadow = new DropShadow();

    readonly tooltip = new TreemapSeriesTooltip();

    readonly highlightStyle = new TreemapHighlightStyle();

    private getNodePaddingTop(nodeDatum: TreemapNodeDatum, bbox: BBox) {
        const { title, subtitle, nodePadding } = this;
        const label = nodeDatum.label;
        if (nodeDatum.isLeaf || !label || nodeDatum.depth === 0) {
            return nodePadding;
        }

        const font = nodeDatum.depth > 1 ? subtitle : title;
        const textSize = getTextSize(label, font);
        const heightRatioThreshold = 3;
        if (font.fontSize > bbox.width / heightRatioThreshold || font.fontSize > bbox.height / heightRatioThreshold) {
            return nodePadding;
        }

        if (textSize.height >= bbox.height) {
            return nodePadding;
        }

        return textSize.height + nodePadding * 2;
    }

    private getNodePadding(nodeDatum: TreemapNodeDatum, bbox: BBox) {
        const { nodePadding } = this;
        const top = this.getNodePaddingTop(nodeDatum, bbox);
        return {
            top,
            right: nodePadding,
            bottom: nodePadding,
            left: nodePadding,
        };
    }

    /**
     * Squarified Treemap algorithm
     * https://www.win.tue.nl/~vanwijk/stm.pdf
     */
    private squarify(
        nodeDatum: TreemapNodeDatum,
        bbox: BBox,
        outputNodesBoxes: Map<TreemapNodeDatum, BBox> = new Map()
    ) {
        const targetTileAspectRatio = 1; // The width and height will tend to this ratio

        const padding = this.getNodePadding(nodeDatum, bbox);
        outputNodesBoxes.set(nodeDatum, bbox);

        const width = bbox.width - padding.left - padding.right;
        const height = bbox.height - padding.top - padding.bottom;
        if (width <= 0 || height <= 0 || nodeDatum.value <= 0) {
            return outputNodesBoxes;
        }

        let stackSum = 0;
        let startIndex = 0;
        let minRatioDiff = Infinity;
        let partitionSum = nodeDatum.value;
        const children = nodeDatum.children;
        const partition = new BBox(bbox.x + padding.left, bbox.y + padding.top, width, height);

        for (let i = 0; i < children.length; i++) {
            const value = children[i].value;
            const firstValue = children[startIndex].value;
            const isVertical = partition.width < partition.height;
            stackSum += value;

            const partThickness = isVertical ? partition.height : partition.width;
            const partLength = isVertical ? partition.width : partition.height;
            const firstTileLength = (partLength * firstValue) / stackSum;
            let stackThickness = (partThickness * stackSum) / partitionSum;

            const ratio = Math.max(firstTileLength, stackThickness) / Math.min(firstTileLength, stackThickness);
            const diff = Math.abs(targetTileAspectRatio - ratio);
            if (diff < minRatioDiff) {
                minRatioDiff = diff;
                continue;
            }

            // Go one step back and process the best match
            stackSum -= value;
            stackThickness = (partThickness * stackSum) / partitionSum;
            let start = isVertical ? partition.x : partition.y;
            for (let j = startIndex; j < i; j++) {
                const child = children[j];

                const x = isVertical ? start : partition.x;
                const y = isVertical ? partition.y : start;
                const length = (partLength * child.value) / stackSum;
                const width = isVertical ? length : stackThickness;
                const height = isVertical ? stackThickness : length;

                const childBox = new BBox(x, y, width, height);
                this.squarify(child, childBox, outputNodesBoxes);

                partitionSum -= child.value;
                start += length;
            }

            if (isVertical) {
                partition.y += stackThickness;
                partition.height -= stackThickness;
            } else {
                partition.x += stackThickness;
                partition.width -= stackThickness;
            }
            startIndex = i;
            stackSum = 0;
            minRatioDiff = Infinity;
            i--;
        }

        // Process remaining space
        const isVertical = partition.width < partition.height;
        let start = isVertical ? partition.x : partition.y;
        for (let i = startIndex; i < children.length; i++) {
            const x = isVertical ? start : partition.x;
            const y = isVertical ? partition.y : start;
            const part = children[i].value / partitionSum;
            const width = partition.width * (isVertical ? part : 1);
            const height = partition.height * (isVertical ? 1 : part);
            const childBox = new BBox(x, y, width, height);
            this.squarify(children[i], childBox, outputNodesBoxes);
            start += isVertical ? width : height;
        }

        return outputNodesBoxes;
    }

    async processData() {
        if (!this.data) {
            return;
        }

        const { data, sizeKey, labelKey, colorKey, colorDomain, colorRange, groupFill } = this;

        const colorScale = new ColorScale();
        colorScale.domain = colorDomain;
        colorScale.range = colorRange;

        const createTreeNodeDatum = (datum: TreeDatum, depth = 0, parent?: TreemapNodeDatum) => {
            const label = (labelKey && (datum[labelKey] as string)) || '';
            const colorScaleValue = colorKey ? datum[colorKey] ?? depth : depth;
            const isLeaf = !datum.children;
            const fill =
                typeof colorScaleValue === 'string'
                    ? colorScaleValue
                    : isLeaf || !groupFill
                    ? colorScale.convert(colorScaleValue)
                    : groupFill;
            const nodeDatum: TreemapNodeDatum = {
                datum,
                depth,
                parent,
                value: 0,
                label,
                fill,
                series: this,
                isLeaf,
                children: [] as TreemapNodeDatum[],
            };
            if (isLeaf) {
                nodeDatum.value = sizeKey ? datum[sizeKey] : 1;
            } else {
                datum.children!.forEach((child) => {
                    const childNodeDatum = createTreeNodeDatum(child, depth + 1, nodeDatum);
                    nodeDatum.value += childNodeDatum.value;
                    nodeDatum.children.push(childNodeDatum);
                });
                nodeDatum.children.sort((a, b) => {
                    return b.value - a.value;
                });
            }
            return nodeDatum;
        };
        this.dataRoot = createTreeNodeDatum(data);
    }

    async createNodeData() {
        return [];
    }

    async update() {
        await this.updateSelections();
        await this.updateNodes();
    }

    async updateSelections() {
        if (!this.nodeDataRefresh) {
            return;
        }
        this.nodeDataRefresh = false;

        const { chart, dataRoot } = this;

        if (!chart || !dataRoot) {
            return;
        }

        const seriesRect = chart.getSeriesRect();

        if (!seriesRect) {
            return;
        }

        const descendants = [] as TreemapNodeDatum[];
        const traverse = (datum: TreemapNodeDatum) => {
            descendants.push(datum);
            datum.children?.forEach(traverse);
        };
        traverse(this.dataRoot!);

        const { groupSelection, highlightSelection } = this;
        const update = (selection: typeof groupSelection) => {
            const updateGroups = selection.setData(descendants);
            updateGroups.exit.remove();

            const enterGroups = updateGroups.enter.append(Group);
            enterGroups.append(Rect);
            enterGroups.append(Text).each((node: any) => (node.tag = TextNodeTag.Name));
            enterGroups.append(Text).each((node: any) => (node.tag = TextNodeTag.Value));

            return updateGroups.merge(enterGroups) as any;
        };

        this.groupSelection = update(groupSelection);
        this.highlightSelection = update(highlightSelection);
    }

    private isDatumHighlighted(datum: TreemapNodeDatum) {
        const highlightedDatum = this.highlightManager?.getActiveHighlight();
        return datum === highlightedDatum && (datum.isLeaf || this.highlightGroups);
    }

    private getTileFormat(datum: TreemapNodeDatum, isHighlighted: boolean): AgTreemapSeriesFormat {
        const { formatter } = this;
        if (!formatter) {
            return {};
        }

        const { gradient, colorKey, labelKey, sizeKey, tileStroke, tileStrokeWidth, groupStroke, groupStrokeWidth } =
            this;

        const stroke = datum.isLeaf ? tileStroke : groupStroke;
        const strokeWidth = datum.isLeaf ? tileStrokeWidth : groupStrokeWidth;

        return formatter({
            seriesId: this.id,
            datum: datum.datum,
            depth: datum.depth,
            parent: datum.parent?.datum,
            colorKey,
            sizeKey,
            labelKey,
            fill: datum.fill,
            stroke,
            strokeWidth,
            gradient,
            highlighted: isHighlighted,
        });
    }

    async updateNodes() {
        if (!this.chart) {
            return;
        }

        const {
            gradient,
            highlightStyle: {
                item: {
                    fill: highlightedFill,
                    fillOpacity: highlightedFillOpacity,
                    stroke: highlightedStroke,
                    strokeWidth: highlightedDatumStrokeWidth,
                },
                text: { color: highlightedTextColor },
            },
            tileStroke,
            tileStrokeWidth,
            groupStroke,
            groupStrokeWidth,
            tileShadow,
            labelShadow,
        } = this;

        const seriesRect = this.chart.getSeriesRect()!;
        const boxes = this.squarify(this.dataRoot!, new BBox(0, 0, seriesRect.width, seriesRect.height));
        const labelMeta = this.buildLabelMeta(boxes);

        const updateRectFn = (rect: Rect, datum: TreemapNodeDatum, isDatumHighlighted: boolean) => {
            const box = boxes.get(datum)!;
            if (!box) {
                rect.visible = false;
                return;
            }

            const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : datum.fill;
            const fillOpacity = (isDatumHighlighted ? highlightedFillOpacity : 1) ?? 1;
            const stroke =
                isDatumHighlighted && highlightedStroke !== undefined
                    ? highlightedStroke
                    : datum.isLeaf
                    ? tileStroke
                    : groupStroke;
            const strokeWidth =
                isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                    ? highlightedDatumStrokeWidth
                    : datum.isLeaf
                    ? tileStrokeWidth
                    : groupStrokeWidth;

            const format = this.getTileFormat(datum, isDatumHighlighted);

            rect.fill = format?.fill ?? fill;
            rect.fillOpacity = format?.fillOpacity ?? fillOpacity;
            rect.stroke = format?.stroke ?? stroke;
            rect.strokeWidth = format?.strokeWidth ?? strokeWidth;
            rect.gradient = format?.gradient ?? gradient;
            rect.fillShadow = tileShadow;
            rect.crisp = true;

            rect.x = box.x;
            rect.y = box.y;
            rect.width = box.width;
            rect.height = box.height;
            rect.visible = true;

            if (isDatumHighlighted && !datum.isLeaf) {
                const padding = this.getNodePadding(datum, box);
                const x0 = box.x + padding.left;
                const x1 = box.x + box.width - padding.right;
                const y0 = box.y + padding.top;
                const y1 = box.y + box.height - padding.bottom;

                if (rect.clipPath) {
                    rect.clipPath.clear();
                } else {
                    rect.clipPath = new Path2D();
                }
                rect.clipMode = 'punch-out';
                rect.clipPath.moveTo(x0, y0);
                rect.clipPath.lineTo(x1, y0);
                rect.clipPath.lineTo(x1, y1);
                rect.clipPath.lineTo(x0, y1);
                rect.clipPath.lineTo(x0, y0);
                rect.clipPath.closePath();
            }
        };
        this.groupSelection.selectByClass(Rect).each((rect, datum) => updateRectFn(rect, datum, false));
        this.highlightSelection.selectByClass(Rect).each((rect, datum) => {
            const isDatumHighlighted = this.isDatumHighlighted(datum);

            rect.visible = isDatumHighlighted;
            if (rect.visible) {
                updateRectFn(rect, datum, isDatumHighlighted);
            }
        });

        const updateLabelFn = (text: Text, datum: TreemapNodeDatum, highlighted: boolean) => {
            const meta = labelMeta.get(datum);
            const label = meta?.label;
            if (!label) {
                text.visible = false;
                return;
            }

            text.text = label.text;
            text.fontFamily = label.style.fontFamily;
            text.fontSize = label.style.fontSize;
            text.fontWeight = label.style.fontWeight;
            text.fill = highlighted ? highlightedTextColor ?? label.style.color : label.style.color;
            text.fillShadow = highlighted ? undefined : labelShadow;

            text.textAlign = label.hAlign;
            text.textBaseline = label.vAlign;
            text.x = label.x;
            text.y = label.y;
            text.visible = true;
        };
        this.groupSelection
            .selectByTag<Text>(TextNodeTag.Name)
            .each((text, datum) => updateLabelFn(text, datum, false));
        this.highlightSelection.selectByTag<Text>(TextNodeTag.Name).each((text, datum) => {
            const isDatumHighlighted = this.isDatumHighlighted(datum);

            text.visible = isDatumHighlighted;
            if (text.visible) {
                updateLabelFn(text, datum, isDatumHighlighted);
            }
        });

        const updateValueFn = (text: Text, datum: TreemapNodeDatum, highlighted: boolean) => {
            const meta = labelMeta.get(datum);
            const label = meta?.value;
            if (!label) {
                text.visible = false;
                return;
            }

            text.text = label.text;
            text.fontFamily = label.style.fontFamily;
            text.fontSize = label.style.fontSize;
            text.fontWeight = label.style.fontWeight;
            text.fill = highlighted ? highlightedTextColor ?? label.style.color : label.style.color;
            text.fillShadow = highlighted ? undefined : labelShadow;

            text.textAlign = label.hAlign;
            text.textBaseline = label.vAlign;
            text.x = label.x;
            text.y = label.y;
            text.visible = true;
        };
        this.groupSelection
            .selectByTag<Text>(TextNodeTag.Value)
            .each((text, datum) => updateValueFn(text, datum, false));
        this.highlightSelection.selectByTag<Text>(TextNodeTag.Value).each((text, datum) => {
            const isDatumHighlighted = this.isDatumHighlighted(datum);

            text.visible = isDatumHighlighted;
            if (text.visible) {
                updateValueFn(text, datum, isDatumHighlighted);
            }
        });
    }

    buildLabelMeta(boxes: Map<TreemapNodeDatum, BBox>) {
        const { labels, title, subtitle, nodePadding, labelKey } = this;

        type TextMeta = {
            text: string;
            style: Label;
            x: number;
            y: number;
            hAlign: CanvasTextAlign;
            vAlign: CanvasTextBaseline;
        };

        const labelMeta = new Map<TreemapNodeDatum, { label?: TextMeta; value?: TextMeta }>();

        boxes.forEach((box, datum) => {
            if (!labelKey || datum.depth === 0) {
                return;
            }

            let labelText = datum.isLeaf ? datum.label : datum.label.toUpperCase();

            let labelStyle: Label;
            if (datum.isLeaf) {
                // Choose the font size that fits
                labelStyle =
                    [labels.large, labels.medium, labels.small].find((s) => {
                        const { width, height } = getTextSize(labelText, s);
                        return width < box.width && height < box.height;
                    }) || labels.small;
            } else if (datum.depth === 1) {
                labelStyle = title;
            } else {
                labelStyle = subtitle;
            }

            const labelSize = getTextSize(labelText, labelStyle);
            const availTextWidth = box.width - 2 * nodePadding;
            const availTextHeight = box.height - 2 * nodePadding;
            const minSizeRatio = 3;
            if (labelStyle.fontSize > box.width / minSizeRatio || labelStyle.fontSize > box.height / minSizeRatio) {
                // Avoid labels on too small tiles
                return;
            }

            // Crop text if not enough space
            if (labelSize.width > availTextWidth) {
                const textLength = Math.floor((labelText.length * availTextWidth) / labelSize.width) - 1;
                labelText = `${labelText.substring(0, textLength)}…`;
            }

            const valueConfig = labels.value;
            const valueStyle = valueConfig.style;
            const valueMargin = (labelStyle.fontSize + valueStyle.fontSize) / 8;
            const valueText = String(
                datum.isLeaf
                    ? valueConfig.formatter
                        ? valueConfig.formatter({ datum: datum.datum })
                        : valueConfig.key
                        ? datum.datum[valueConfig.key]
                        : ''
                    : ''
            );
            const valueSize = getTextSize(valueText, valueStyle);
            const hasValueText =
                valueText &&
                valueSize.width < availTextWidth &&
                valueSize.height + labelSize.height + valueMargin < availTextHeight;

            labelMeta.set(datum, {
                label: {
                    text: labelText,
                    style: labelStyle,
                    ...(datum.isLeaf
                        ? {
                              hAlign: 'center',
                              vAlign: 'middle',
                              x: box.x + box.width / 2,
                              y: box.y + box.height / 2 - (hasValueText ? valueSize.height / 2 + valueMargin / 2 : 0),
                          }
                        : {
                              hAlign: 'left',
                              vAlign: 'top',
                              x: box.x + nodePadding,
                              y: box.y + nodePadding,
                          }),
                },
                value: hasValueText
                    ? {
                          text: valueText,
                          style: valueStyle,
                          hAlign: 'center',
                          vAlign: 'middle',
                          x: box.x + box.width / 2,
                          y: box.y + box.height / 2 + labelSize.height / 2 + valueMargin / 2,
                      }
                    : undefined,
            });
        });

        return labelMeta;
    }

    getDomain(_direction: ChartAxisDirection): any[] {
        return [0, 1];
    }

    protected getNodeClickEvent(event: MouseEvent, datum: TreemapNodeDatum): TreemapSeriesNodeClickEvent {
        return new TreemapSeriesNodeClickEvent(this.labelKey, this.sizeKey, this.colorKey, event, datum, this);
    }

    getTooltipHtml(nodeDatum: TreemapNodeDatum): string {
        if (!this.highlightGroups && !nodeDatum.isLeaf) {
            return '';
        }

        const { tooltip, sizeKey, labelKey, colorKey, rootName, id: seriesId, labels } = this;
        const { datum } = nodeDatum;
        const { renderer: tooltipRenderer } = tooltip;

        const title: string | undefined = nodeDatum.depth ? datum[labelKey] : rootName || datum[labelKey];
        let content = '';
        const format = this.getTileFormat(nodeDatum, false);
        const color = format?.fill || nodeDatum.fill || 'gray';

        const valueKey = labels.value.key;
        const valueFormatter = labels.value.formatter;
        if (valueKey || valueFormatter) {
            let valueText: string | undefined = '';
            if (valueFormatter) {
                valueText = valueFormatter({ datum });
            } else {
                const value = datum[valueKey!];
                if (typeof value === 'number' && isFinite(value)) {
                    valueText = toFixed(value);
                }
            }
            if (valueText) {
                if (labels.value.name) {
                    content += `<b>${labels.value.name}:</b> `;
                }
                content += valueText;
            }
        }

        const defaults: AgTooltipRendererResult = {
            title,
            backgroundColor: color,
            content,
        };

        if (tooltipRenderer) {
            return toTooltipHtml(
                tooltipRenderer({
                    datum: nodeDatum.datum,
                    parent: nodeDatum.parent?.datum,
                    depth: nodeDatum.depth,
                    sizeKey,
                    labelKey,
                    colorKey,
                    title,
                    color,
                    seriesId,
                }),
                defaults
            );
        }

        return toTooltipHtml(defaults);
    }

    getLegendData(): LegendDatum[] {
        // Override point for subclasses.
        return [];
    }
}
