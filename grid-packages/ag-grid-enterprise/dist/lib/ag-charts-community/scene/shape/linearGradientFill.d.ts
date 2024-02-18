import type { RenderContext } from '../node';
import type { Path } from './path';
import { Shape } from './shape';
export declare class LinearGradientFill extends Shape {
    direction: 'to-bottom' | 'to-right';
    stops?: string[];
    get mask(): Path | undefined;
    set mask(newMask: Path | undefined);
    private _mask?;
    isPointInPath(x: number, y: number): boolean;
    computeBBox(): import("../bbox").BBox | undefined;
    render(renderCtx: RenderContext): void;
}
