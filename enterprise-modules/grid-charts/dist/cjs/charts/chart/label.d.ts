import { FontStyle, FontWeight } from "../scene/shape/text";
export declare class Label {
    onChange?: () => void;
    protected _enabled: boolean;
    enabled: boolean;
    private _fontStyle?;
    fontStyle: FontStyle | undefined;
    private _fontWeight?;
    fontWeight: FontWeight | undefined;
    private _fontSize;
    fontSize: number;
    private _fontFamily;
    fontFamily: string;
    private _color;
    color: string;
    protected update(): void;
}
