import type { BBox } from '../bbox';
interface GradientColorStop {
    offset: number;
    color: string;
}
export declare abstract class Gradient {
    stops: GradientColorStop[];
    abstract createGradient(ctx: CanvasRenderingContext2D, bbox: BBox): CanvasGradient | string;
}
export {};
