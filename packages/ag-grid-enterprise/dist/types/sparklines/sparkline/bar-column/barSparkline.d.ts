import type { Point } from '../sparkline';
import type { RectNodeDatum } from './barColumnSparkline';
import { BarColumnSparkline } from './barColumnSparkline';
interface BarNodeDatum extends RectNodeDatum {
}
export declare class BarSparkline extends BarColumnSparkline {
    protected updateYScaleRange(): void;
    protected updateXScaleRange(): void;
    protected updateAxisLine(): void;
    protected generateNodeData(): BarNodeDatum[] | undefined;
    protected getDistance(p1: Point, p2: Point): number;
}
export {};
