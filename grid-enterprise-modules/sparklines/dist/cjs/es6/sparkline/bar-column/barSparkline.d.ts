import { BarColumnSparkline, RectNodeDatum } from './barColumnSparkline';
import { Point } from '../sparkline';
interface BarNodeDatum extends RectNodeDatum {
}
export declare class BarSparkline extends BarColumnSparkline {
    static className: string;
    protected updateYScaleRange(): void;
    protected updateXScaleRange(): void;
    protected updateAxisLine(): void;
    protected generateNodeData(): BarNodeDatum[] | undefined;
    protected getDistance(p1: Point, p2: Point): number;
}
export {};
