import { Gradient } from './gradient';
import { BBox } from '../bbox';
export declare class LinearGradient extends Gradient {
    angle: number;
    createGradient(ctx: CanvasRenderingContext2D, bbox: BBox): CanvasGradient | string;
}
