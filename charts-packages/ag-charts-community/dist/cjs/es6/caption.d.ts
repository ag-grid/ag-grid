import { Text, FontStyle, FontWeight } from './scene/shape/text';
import { Observable } from './util/observable';
export declare class Caption extends Observable {
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
    constructor();
}
