import { Marker } from './marker';
export declare class Circle extends Marker {
    static className: string;
    isPointInPath(x: number, y: number): boolean;
    isPointInStroke(x: number, y: number): boolean;
    render(ctx: CanvasRenderingContext2D): void;
}
