import { Text, getFont } from './scene/shape/text';
import { PointerEvents } from './scene/node';
import {
    BOOLEAN,
    NUMBER,
    OPT_COLOR_STRING,
    OPT_FONT_STYLE,
    OPT_FONT_WEIGHT,
    OPT_NUMBER,
    STRING,
    Validate,
} from './util/validation';
import { FontStyle, FontWeight } from './chart/agChartOptions';
import { ActionOnSet, ProxyPropertyOnWrite } from './util/proxy';

export class Caption {
    static readonly PADDING = 10;

    readonly node: Text = new Text();

    @Validate(BOOLEAN)
    enabled = false;

    @Validate(STRING)
    @ActionOnSet<Caption>({
        newValue(text: string) {
            this.updateWrapping(text, this.maxWidth ?? Infinity, this.maxHeight ?? Infinity);
        },
    })
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

    @Validate(NUMBER(0))
    lineHeightRatio: number = 1.15;

    @ActionOnSet<Caption>({
        newValue(maxWidth: number | undefined) {
            this.updateWrapping(this.text, maxWidth ?? Infinity, this.maxHeight ?? Infinity);
        },
    })
    maxWidth?: number = undefined;

    @ActionOnSet<Caption>({
        newValue(maxHeight: number | undefined) {
            this.updateWrapping(this.text, this.maxWidth ?? Infinity, maxHeight ?? Infinity);
        },
    })
    maxHeight?: number = undefined;

    constructor() {
        const node = this.node;
        node.textAlign = 'center';
        node.pointerEvents = PointerEvents.None;
    }

    private updateWrapping(text: string, maxWidth: number, maxHeight: number) {
        if (!isFinite(maxWidth) && !isFinite(maxHeight)) {
            this.node.text = text;
            return;
        }
        const { fontSize, fontFamily, fontStyle, fontWeight } = this;
        const lineHeight = this.lineHeight ?? fontSize * this.lineHeightRatio;
        const wrapped = Text.wrap(
            text,
            maxWidth,
            maxHeight,
            getFont(fontSize, fontFamily, fontStyle, fontWeight),
            fontSize,
            lineHeight,
            true
        );
        this.node.text = wrapped;
    }
}
