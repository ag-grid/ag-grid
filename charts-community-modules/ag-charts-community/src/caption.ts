import { Text } from './scene/shape/text';
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
    @ProxyPropertyOnWrite('node')
    color: string | undefined;

    @Validate(OPT_NUMBER(0))
    public spacing?: number = Caption.PADDING;

    constructor() {
        const node = this.node;
        node.textAlign = 'center';
        node.textBaseline = 'top';
        node.pointerEvents = PointerEvents.None;
    }
}
