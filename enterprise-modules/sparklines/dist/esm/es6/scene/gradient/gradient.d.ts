import { BBox } from "../bbox";
export interface GradientColorStop {
    offset: number;
    color: string;
}
export declare abstract class Gradient {
    stops: GradientColorStop[];
    abstract generateGradient(ctx: CanvasRenderingContext2D, bbox: BBox): CanvasGradient | string;
}
