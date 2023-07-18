import { Gradient } from './gradient';
import type { BBox } from '../bbox';
export declare class LinearGradient extends Gradient {
    angle: number;
    createGradient(ctx: CanvasRenderingContext2D, bbox: BBox): CanvasGradient | string;
}
//# sourceMappingURL=linearGradient.d.ts.map