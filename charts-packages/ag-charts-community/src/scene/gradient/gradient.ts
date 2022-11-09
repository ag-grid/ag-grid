import { BBox } from '../bbox';

interface GradientColorStop {
    offset: number;
    color: string;
}

export abstract class Gradient {
    stops: GradientColorStop[] = [];

    abstract createGradient(ctx: CanvasRenderingContext2D, bbox: BBox): CanvasGradient | string;
}
