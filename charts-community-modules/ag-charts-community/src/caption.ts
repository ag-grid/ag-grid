import { Text } from './scene/shape/text';
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
    Validate,
} from './util/validation';
import { FontStyle, FontWeight, TextWrap } from './chart/agChartOptions';
import { ProxyPropertyOnWrite } from './util/proxy';

export class Caption {
    static readonly PADDING = 10;

    readonly node: Text = new Text();

    @Validate(BOOLEAN)
    enabled = false;

    @Validate(STRING)
    @ProxyPropertyOnWrite('node')
    text: string = '';

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

    @Validate(OPT_STRING)
    wrapping?: TextWrap = 'always';

    constructor() {
        const node = this.node;
        node.textAlign = 'center';
        node.pointerEvents = PointerEvents.None;
    }

    computeTextWrap(containerWidth: number, containerHeight: number) {
        const { text, wrapping } = this;
        const maxWidth = this.maxWidth == null ? containerWidth : Math.min(this.maxWidth, containerWidth);
        const maxHeight = this.maxHeight == null ? containerHeight : this.maxHeight;
        if (wrapping === 'never' || (!isFinite(maxWidth) && !isFinite(maxHeight))) {
            this.node.text = text;
            return;
        }
        const wrapped = Text.wrap(text, maxWidth, maxHeight, this);
        this.node.text = wrapped;
    }
}
