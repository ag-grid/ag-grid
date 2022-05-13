import { Shape } from '../../scene/shape/shape';
export declare abstract class Marker extends Shape {
    protected _x: number;
    set x(value: number);
    get x(): number;
    protected _y: number;
    set y(value: number);
    get y(): number;
    protected _size: number;
    set size(value: number);
    get size(): number;
}
