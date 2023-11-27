import type { BBox } from '../bbox';
import { Gradient } from './gradient';
export declare class LinearGradient extends Gradient {
    angle: number;
    createGradient(ctx: CanvasRenderingContext2D, bbox: BBox): CanvasGradient | string;
}
