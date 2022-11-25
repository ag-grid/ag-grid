import { Selection } from '../../../scene/selection';
import { HdpiCanvas } from '../../../canvas/hdpiCanvas';
import { Label } from '../../label';
import { SeriesNodeDatum, SeriesTooltip, SeriesNodeClickEvent } from '../series';
import { HierarchySeries } from './hierarchySeries';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { Group } from '../../../scene/group';
import { Text } from '../../../scene/shape/text';
import { Rect } from '../../../scene/shape/rect';
import { DropShadow } from '../../../scene/dropShadow';
import { LinearScale } from '../../../scale/linearScale';
import { ChartAxisDirection } from '../../chartAxis';
import { LegendDatum } from '../../legend';
import { toFixed } from '../../../util/number';
import { Path2D } from '../../../scene/path2D';
import { BBox } from '../../../scene/bbox';
import {
    BOOLEAN,
    NUMBER,
    NUMBER_ARRAY,
    OPT_FUNCTION,
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

enum TextNodeTag {
    Name,
    Value,
}

function getTextSize(text: string, style: Label) {
    return HdpiCanvas.getTextSize(text, [style.fontWeight, `${style.fontSize}px`, style.fontFamily].join(' '));
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
        color: (() => {
            const label = new Label();
            label.color = 'white';
            return label;
        })(),
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

    @Validate(BOOLEAN)
    colorParents: boolean = false;

    @Validate(BOOLEAN)
    gradient: boolean = true;

    @Validate(OPT_FUNCTION)
    formatter?: (params: AgTreemapSeriesFormatterParams) => AgTreemapSeriesFormat = undefined;

    @Validate(STRING)
    colorName: string = 'Change';

    @Validate(STRING)
    rootName: string = 'Root';

    shadow: DropShadow = (() => {
        const shadow = new DropShadow();
        shadow.color = 'rgba(0, 0, 0, 0.4)';
        shadow.xOffset = 1.5;
        shadow.yOffset = 1.5;
        return shadow;
    })();

    readonly tooltip = new TreemapSeriesTooltip();

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
     */
    private squarify(
        nodeDatum: TreemapNodeDatum,
        bbox: BBox,
        outputNodesBoxes: Map<TreemapNodeDatum, BBox> = new Map()
    ) {
        const targetCellRatio = 1;

        const padding = this.getNodePadding(nodeDatum, bbox);
        outputNodesBoxes.set(nodeDatum, bbox);

        const width = bbox.width - padding.left - padding.right;
        const height = bbox.height - padding.top - padding.bottom;
        if (width <= 0 || height <= 0 || nodeDatum.value <= 0) {
            return outputNodesBoxes;
        }

        let colSum = 0;
        let rowSum = 0;
        let minRatioDiff = Infinity;
        let startIndex = 0;
        let partitionSum = nodeDatum.value;
        const children = nodeDatum.children;
        const partition = new BBox(bbox.x + padding.left, bbox.y + padding.top, width, height);

        for (let i = 0; i < children.length; i++) {
            const value = children[i].value;
            if (partition.width < partition.height) {
                rowSum += value;
                let rowHeight = (partition.height * rowSum) / partitionSum;
                const firstCellWidth = (partition.width * children[startIndex].value) / rowSum;
                const ratio = Math.max(firstCellWidth, rowHeight) / Math.min(firstCellWidth, rowHeight);
                const diff = Math.abs(targetCellRatio - ratio);
                if (diff > minRatioDiff) {
                    rowHeight = (partition.height * (rowSum - value)) / partitionSum;
                    rowSum -= value;
                    let startX = partition.x;
                    for (let j = startIndex; j < i; j++) {
                        const childBox = new BBox(
                            startX,
                            partition.y,
                            (partition.width * children[j].value) / rowSum,
                            rowHeight
                        );
                        this.squarify(children[j], childBox, outputNodesBoxes);
                        partitionSum -= children[j].value;
                        startX += childBox.width;
                    }
                    partition.y += rowHeight;
                    partition.height -= rowHeight;
                    startIndex = i;
                    i--;
                    rowSum = 0;
                    minRatioDiff = Infinity;
                } else {
                    minRatioDiff = diff;
                }
            } else {
                colSum += value;
                let colWidth = (partition.width * colSum) / partitionSum;
                const firstCellHeight = (partition.height * children[startIndex].value) / colSum;
                const ratio = Math.max(colWidth, firstCellHeight) / Math.min(colWidth, firstCellHeight);
                const diff = Math.abs(targetCellRatio - ratio);
                if (diff > minRatioDiff) {
                    colWidth = (partition.width * (colSum - value)) / partitionSum;
                    colSum -= value;
                    let startY = partition.y;
                    for (let j = startIndex; j < i; j++) {
                        const childBox = new BBox(
                            partition.x,
                            startY,
                            colWidth,
                            (partition.height * children[j].value) / colSum
                        );
                        this.squarify(children[j], childBox, outputNodesBoxes);
                        partitionSum -= children[j].value;
                        startY += childBox.height;
                    }
                    partition.x += colWidth;
                    partition.width -= colWidth;
                    startIndex = i;
                    i--;
                    colSum = 0;
                    minRatioDiff = Infinity;
                } else {
                    minRatioDiff = diff;
                }
            }
        }
        let startX = partition.x;
        let startY = partition.y;
        for (let i = startIndex; i < children.length; i++) {
            if (partition.width < partition.height) {
                const childBox = new BBox(
                    startX,
                    partition.y,
                    (partition.width * children[i].value) / partitionSum,
                    partition.height
                );
                this.squarify(children[i], childBox, outputNodesBoxes);
                startX += childBox.width;
            } else {
                const childBox = new BBox(
                    partition.x,
                    startY,
                    partition.width,
                    (partition.height * children[i].value) / partitionSum
                );
                this.squarify(children[i], childBox, outputNodesBoxes);
                startY += childBox.height;
            }
        }

        return outputNodesBoxes;
    }

    async processData() {
        if (!this.data) {
            return;
        }

        const { data, sizeKey, labelKey, colorKey, colorDomain, colorRange, colorParents } = this;

        const colorScale = new LinearScale();
        colorScale.domain = colorDomain;
        colorScale.range = colorRange;

        const createTreeNodeDatum = (datum: TreeDatum, depth = 0, parent?: TreemapNodeDatum) => {
            const label = (labelKey && (datum[labelKey] as string)) || '';
            const colorScaleValue = colorKey ? datum[colorKey] : depth;
            const isLeaf = !datum.children;
            const nodeDatum: TreemapNodeDatum = {
                datum,
                depth,
                parent,
                value: 0,
                label,
                fill: isLeaf || colorParents ? colorScale.convert(colorScaleValue) : '#272931',
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

    async updateNodes() {
        if (!this.chart) {
            return;
        }

        const {
            shadow,
            gradient,
            chart: { highlightedDatum },
            highlightStyle: {
                item: {
                    fill: highlightedFill,
                    fillOpacity: highlightedFillOpacity,
                    stroke: highlightedStroke,
                    strokeWidth: highlightedDatumStrokeWidth,
                },
            },
            formatter,
            colorKey,
            labelKey,
            sizeKey,
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
                    : datum.depth < 2
                    ? undefined
                    : 'black';
            const strokeWidth =
                isDatumHighlighted && highlightedDatumStrokeWidth !== undefined ? highlightedDatumStrokeWidth : 1;

            let format: AgTreemapSeriesFormat | undefined;
            if (formatter) {
                format = formatter({
                    seriesId: this.id,
                    datum: datum.datum,
                    colorKey,
                    sizeKey,
                    labelKey,
                    fill,
                    stroke,
                    strokeWidth,
                    gradient,
                    highlighted: isDatumHighlighted,
                });
            }

            rect.fill = format?.fill ?? fill;
            rect.fillOpacity = format?.fillOpacity ?? fillOpacity;
            rect.stroke = format?.stroke ?? stroke;
            rect.strokeWidth = format?.strokeWidth ?? strokeWidth;
            rect.gradient = format?.gradient ?? gradient;
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
            const isDatumHighlighted = datum === highlightedDatum;

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
            text.fill = highlighted ? 'black' : label.style.color;
            text.fillShadow = !highlighted ? shadow : undefined;

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
            const isDatumHighlighted = datum === highlightedDatum;

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
            text.fill = highlighted ? 'black' : label.style.color;
            text.fillShadow = !highlighted ? shadow : undefined;

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
            const isDatumHighlighted = datum === highlightedDatum;

            text.visible = isDatumHighlighted;
            if (text.visible) {
                updateValueFn(text, datum, isDatumHighlighted);
            }
        });
    }

    buildLabelMeta(boxes: Map<TreemapNodeDatum, BBox>) {
        const { labels, title, subtitle, nodePadding, colorKey, labelKey } = this;

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
                // Avoid labels on too small cells
                return;
            }

            // Crop text if not enough space
            if (labelSize.width > availTextWidth) {
                const textLength = Math.floor((labelText.length * availTextWidth) / labelSize.width) - 1;
                labelText = `${labelText.substring(0, textLength)}…`;
            }

            const valueStyle = labels.color;
            const valueMargin = (labelStyle.fontSize + valueStyle.fontSize) / 8;
            const valueText =
                colorKey && datum.isLeaf && typeof datum.value === 'number' && isFinite(datum.value)
                    ? `${toFixed(datum.datum[colorKey])}%`
                    : '';
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
        const { tooltip, sizeKey, labelKey, colorKey, colorName, rootName, id: seriesId } = this;
        const { datum } = nodeDatum;
        const { renderer: tooltipRenderer } = tooltip;

        const title: string | undefined = nodeDatum.depth ? datum[labelKey] : rootName || datum[labelKey];
        let content: string | undefined = undefined;
        const color = nodeDatum.fill || 'gray';

        if (colorKey && colorName) {
            const colorValue = datum[colorKey];
            if (typeof colorValue === 'number' && isFinite(colorValue)) {
                content = `<b>${colorName}</b>: ${toFixed(datum[colorKey])}`;
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
