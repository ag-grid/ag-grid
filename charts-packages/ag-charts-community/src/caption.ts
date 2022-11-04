import { Text } from './scene/shape/text';
import { PointerEvents } from './scene/node';
import {
    BOOLEAN,
    NUMBER,
    OPT_COLOR_STRING,
    OPT_FONT_STYLE,
    OPT_FONT_WEIGHT,
    STRING,
    Validate,
} from './util/validation';
import { FontStyle, FontWeight } from './chart/agChartOptions';

export class Caption {
    static readonly PADDING = 10;

    readonly node: Text = new Text();

    @Validate(BOOLEAN)
    enabled = false;

    @Validate(STRING)
    private _text: string = '';
    set text(value: string) {
        this._text = value;
        this.node.text = this._text;
    }
    get text(): string {
        return this._text;
    }

    @Validate(OPT_FONT_STYLE)
    private _fontStyle: FontStyle | undefined;
    set fontStyle(value: FontStyle | undefined) {
        this._fontStyle = value;
        this.node.fontStyle = this._fontStyle;
    }
    get fontStyle(): FontStyle | undefined {
        return this._fontStyle;
    }

    @Validate(OPT_FONT_WEIGHT)
    private _fontWeight: FontWeight | undefined;
    set fontWeight(value: FontWeight | undefined) {
        this._fontWeight = value;
        this.node.fontWeight = this._fontWeight;
    }
    get fontWeight(): FontWeight | undefined {
        return this._fontWeight;
    }

    @Validate(NUMBER(0))
    private _fontSize: number = 10;
    set fontSize(value: number) {
        this._fontSize = value;
        this.node.fontSize = this._fontSize;
    }
    get fontSize(): number {
        return this._fontSize;
    }

    @Validate(STRING)
    private _fontFamily: string = 'sans-serif';
    set fontFamily(value: string) {
        this._fontFamily = value;
        this.node.fontFamily = this._fontFamily;
    }
    get fontFamily(): string {
        return this._fontFamily;
    }

    @Validate(OPT_COLOR_STRING)
    private _color: string | undefined;
    set color(value: string | undefined) {
        this._color = value;
        this.node.fill = this._color;
    }
    get color(): string | undefined {
        return this._color;
    }

    constructor() {
        const node = this.node;
        node.textAlign = 'center';
        node.textBaseline = 'top';
        node.pointerEvents = PointerEvents.None;
    }
}
