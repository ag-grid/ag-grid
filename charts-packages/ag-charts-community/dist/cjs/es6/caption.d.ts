import { Text } from './scene/shape/text';
import { FontStyle, FontWeight } from './chart/agChartOptions';
export declare class Caption {
    static readonly PADDING = 10;
    readonly node: Text;
    enabled: boolean;
    private _text;
    set text(value: string);
    get text(): string;
    private _fontStyle;
    set fontStyle(value: FontStyle | undefined);
    get fontStyle(): FontStyle | undefined;
    private _fontWeight;
    set fontWeight(value: FontWeight | undefined);
    get fontWeight(): FontWeight | undefined;
    private _fontSize;
    set fontSize(value: number);
    get fontSize(): number;
    private _fontFamily;
    set fontFamily(value: string);
    get fontFamily(): string;
    private _color;
    set color(value: string | undefined);
    get color(): string | undefined;
    spacing?: number;
    constructor();
}
