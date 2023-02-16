import { Rect } from '../scene/shape/rect';
export declare class Background {
    readonly node: Rect;
    set width(value: number);
    get width(): number;
    set height(value: number);
    get height(): number;
    private _visible;
    set visible(value: boolean);
    get visible(): boolean;
    private _fill?;
    set fill(value: string | undefined);
    get fill(): string | undefined;
}
