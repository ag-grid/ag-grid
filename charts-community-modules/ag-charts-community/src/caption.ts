import { Text, createTextMeasurer, getFont } from './scene/shape/text';
import { PointerEvents } from './scene/node';
import {
    BOOLEAN,
    NUMBER,
    OPT_COLOR_STRING,
    OPT_FONT_STYLE,
    OPT_FONT_WEIGHT,
    OPT_NUMBER,
    OPT_STRING,
    STRING,
    TEXT_WRAP,
    Validate,
} from './util/validation';
import { FontStyle, FontWeight, TextWrap } from './chart/agChartOptions';
import { ProxyPropertyOnWrite } from './util/proxy';

export class Caption {
    static readonly PADDING = 10;

    readonly node: Text = new Text();

    @Validate(BOOLEAN)
    enabled = false;

    @Validate(OPT_STRING)
    @ProxyPropertyOnWrite('node')
    text?: string = undefined;

    @Validate(OPT_FONT_STYLE)
    @ProxyPropertyOnWrite('node')
    fontStyle: FontStyle | undefined;

    @Validate(OPT_FONT_WEIGHT)
    @ProxyPropertyOnWrite('node')
    fontWeight: FontWeight | undefined;

    @Validate(NUMBER(0))
    @ProxyPropertyOnWrite('node')
    fontSize: number = 10;

    @Validate(STRING)
    @ProxyPropertyOnWrite('node')
    fontFamily: string = 'sans-serif';

    @Validate(OPT_COLOR_STRING)
    @ProxyPropertyOnWrite('node', 'fill')
    color: string | undefined;

    @Validate(OPT_NUMBER(0))
    public spacing?: number = Caption.PADDING;

    @Validate(OPT_NUMBER(0))
    lineHeight: number | undefined = undefined;

    @Validate(OPT_NUMBER(0))
    maxWidth?: number = undefined;

    @Validate(OPT_NUMBER(0))
    maxHeight?: number = undefined;

    @Validate(TEXT_WRAP)
    wrapping: TextWrap = 'always';

    constructor() {
        const node = this.node;
        node.textAlign = 'center';
        node.pointerEvents = PointerEvents.None;
    }

    computeTextWrap(containerWidth: number, containerHeight: number) {
        const { text, wrapping } = this;
        const maxWidth = Math.min(this.maxWidth ?? Infinity, containerWidth);
        const maxHeight = this.maxHeight ?? containerHeight;
        if (!isFinite(maxWidth) && !isFinite(maxHeight)) {
            this.node.text = text;
            return;
        }
        if (wrapping === 'never') {
            const font = getFont(this);
            const measurer = createTextMeasurer(font);
            if (text && measurer.width(text) > maxWidth) {
                const trunc = Text.truncateLine(text ?? '', maxWidth, measurer);
                this.node.text = trunc;
            } else {
                this.node.text = text;
            }
            return;
        }
        const wrapOptions = {
            hyphens: wrapping === 'hyphenate',
            breakWord: wrapping === 'always' || wrapping === 'hyphenate',
        };
        const wrapped = Text.wrap(text ?? '', maxWidth, maxHeight, this, wrapOptions);
        this.node.text = wrapped;
    }
}
