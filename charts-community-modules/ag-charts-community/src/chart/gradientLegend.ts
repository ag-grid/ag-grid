import { BBox } from '../scene/bbox';
import { Node } from '../scene/node';
import { Group } from '../scene/group';
import { Rect } from '../scene/shape/rect';
import { Selection } from '../scene/selection';
import { Text, getFont } from '../scene/shape/text';
import { createId } from '../util/id';
import {
    BOOLEAN,
    NUMBER,
    OPT_FONT_STYLE,
    OPT_FONT_WEIGHT,
    OPT_FUNCTION,
    OPT_NUMBER,
    POSITION,
    COLOR_STRING,
    STRING,
    Validate,
} from '../util/validation';
import { Layers } from './layers';
import { LayoutService } from './layout/layoutService';
import { GradientLegendDatum } from './gradientLegendDatum';
import {
    AgChartLegendLabelFormatterParams,
    AgChartLegendPosition,
    FontStyle,
    FontWeight,
    AgChartOrientation,
} from './agChartOptions';

class GradientLegendLabel {
    @Validate(OPT_NUMBER(0))
    maxLength?: number = undefined;

    @Validate(COLOR_STRING)
    color: string = 'black';

    @Validate(OPT_FONT_STYLE)
    fontStyle?: FontStyle = undefined;

    @Validate(OPT_FONT_WEIGHT)
    fontWeight?: FontWeight = undefined;

    @Validate(NUMBER(0))
    fontSize: number = 12;

    @Validate(STRING)
    fontFamily: string = 'Verdana, sans-serif';

    @Validate(OPT_FUNCTION)
    formatter?: (params: AgChartLegendLabelFormatterParams) => string = undefined;

    getFont(): string {
        return getFont(this.fontSize, this.fontFamily, this.fontStyle, this.fontWeight);
    }
}

class GradientLegendItem {
    readonly label = new GradientLegendLabel();
    /** Used to constrain the width of legend items. */
    @Validate(OPT_NUMBER(0))
    maxWidth?: number = undefined;
    @Validate(NUMBER(0))
    padding = 8;
}

class GradientBar {
    thickness = 16;
    preferredLength = 100;
}

export class GradientLegend {
    static className = 'GradientLegend';

    readonly id = createId(this);

    private readonly group: Group = new Group({ name: 'legend', layer: true, zIndex: Layers.LEGEND_ZINDEX });
    private readonly gradientRect: Rect;
    private readonly textSelection: Selection<Text, number>;

    @Validate(BOOLEAN)
    private _enabled = true;
    set enabled(value: boolean) {
        this._enabled = value;
        this.group.visible = value;
    }
    get enabled() {
        return this._enabled;
    }

    @Validate(POSITION)
    position: AgChartLegendPosition = 'right';

    private getOrientation(): AgChartOrientation {
        switch (this.position) {
            case 'right':
            case 'left':
                return 'vertical';
            case 'bottom':
            case 'top':
                return 'horizontal';
        }
    }

    /**
     * Spacing between the legend and the edge of the chart's element.
     */
    @Validate(NUMBER(0))
    spacing = 20;

    gradientBar = new GradientBar();

    readonly item = new GradientLegendItem();

    data: GradientLegendDatum[] = [];

    listeners: any = {};

    constructor(private readonly layoutService: LayoutService) {
        const layoutListener = this.layoutService.addListener('start-layout', (e) => this.update(e.shrinkRect));
        this.destroyFns.push(() => this.layoutService.removeListener(layoutListener));

        this.gradientRect = new Rect();
        this.group.append(this.gradientRect);
        const textContainer = new Group();
        this.group.append(textContainer);
        this.textSelection = Selection.select(textContainer, Text);
        this.destroyFns.push(() => this.detachLegend());
    }

    destroy() {
        this.destroyFns.forEach((f) => f());
    }

    private destroyFns: Function[] = [];

    attachLegend(node: Node) {
        node.append(this.group);
    }

    detachLegend() {
        this.group.parent?.removeChild(this.group);
    }

    private update(shrinkRect: BBox) {
        const newShrinkRect = shrinkRect.clone();
        const data = this.data[0];

        if (!this.enabled || !data || !data.enabled) {
            this.group.visible = false;
            return { shrinkRect: newShrinkRect };
        }

        this.group.visible = true;
        const { colorDomain, colorRange } = data;

        const { spacing } = this;
        const { preferredLength, thickness } = this.gradientBar;
        const { padding, label } = this.item;
        const [textWidth, textHeight] = this.measureMaxText(colorDomain);
        const gradientLength = preferredLength;

        let width: number;
        let height: number;
        let gradientLeft: number;
        let gradientTop: number;
        const orientation = this.getOrientation();
        if (orientation === 'vertical') {
            width = thickness + padding + textWidth;
            height = gradientLength + textHeight;
            gradientLeft = 0;
            gradientTop = textHeight / 2;
            this.gradientRect.width = thickness;
            this.gradientRect.height = gradientLength;
        } else {
            width = gradientLength + textWidth;
            height = thickness + padding + textHeight;
            gradientLeft = textWidth / 2;
            gradientTop = 0;
            this.gradientRect.width = gradientLength;
            this.gradientRect.height = thickness;
        }
        this.gradientRect.x = gradientLeft;
        this.gradientRect.y = gradientTop;
        const colorsString = data.colorRange.join(', ');
        this.gradientRect.fill = `linear-gradient(${orientation === 'vertical' ? 0 : 90}deg, ${colorsString})`;

        let left: number;
        let top: number;
        if (this.position === 'left') {
            left = shrinkRect.x;
            top = shrinkRect.y + shrinkRect.height / 2 - height / 2;
            newShrinkRect.shrink(width + spacing, 'left');
        } else if (this.position === 'right') {
            left = shrinkRect.x + shrinkRect.width - width;
            top = shrinkRect.y + shrinkRect.height / 2 - height / 2;
            newShrinkRect.shrink(width + spacing, 'right');
        } else if (this.position === 'top') {
            left = shrinkRect.x + shrinkRect.width / 2 - width / 2;
            top = shrinkRect.y;
            newShrinkRect.shrink(height + spacing, 'top');
        } else {
            left = shrinkRect.x + shrinkRect.width / 2 - width / 2;
            top = shrinkRect.y + shrinkRect.height - height;
            newShrinkRect.shrink(height + spacing, 'bottom');
        }

        const stops: number[] = [];
        const colorCount = colorRange.length;
        for (let i = 0; i < colorCount; i++) {
            const [d0, d1] = colorDomain;
            const s = d0 + ((d1 - d0) * i) / (colorCount - 1);
            stops.push(s);
        }
        if (orientation === 'vertical') {
            stops.reverse();
        }

        this.textSelection.update(stops).each((node, datum, i) => {
            const t = i / (stops.length - 1);

            node.text = String(datum);
            node.fill = label.color;
            node.fontFamily = label.fontFamily;
            node.fontSize = label.fontSize;
            node.fontStyle = label.fontStyle;
            node.fontWeight = label.fontWeight;

            if (orientation === 'vertical') {
                node.textAlign = 'start';
                node.textBaseline = 'middle';
                node.x = thickness + padding;
                node.y = gradientTop + gradientLength * t;
            } else {
                node.textAlign = 'center';
                node.textBaseline = 'top';
                node.x = gradientLeft + gradientLength * t;
                node.y = thickness + padding;
            }
        });

        this.group.translationX = left;
        this.group.translationY = top;

        return { shrinkRect: newShrinkRect };
    }

    private measureMaxText(colorDomain: number[]) {
        const { label } = this.item;
        const tempText = new Text();
        const boxes: BBox[] = colorDomain.map((d) => {
            const text = String(d);
            tempText.text = text;
            tempText.fill = label.color;
            tempText.fontFamily = label.fontFamily;
            tempText.fontSize = label.fontSize;
            tempText.fontStyle = label.fontStyle;
            tempText.fontWeight = label.fontWeight;
            return tempText.computeBBox();
        });
        const maxWidth = Math.max(...boxes.map((b) => b.width));
        const maxHeight = Math.max(...boxes.map((b) => b.height));
        return [maxWidth, maxHeight];
    }
}
