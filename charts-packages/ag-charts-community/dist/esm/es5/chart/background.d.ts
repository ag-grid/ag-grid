import { Rect } from '../scene/shape/rect';
import { Observable } from '../util/observable';
export declare class Background extends Observable {
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
