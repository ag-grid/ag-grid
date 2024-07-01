import type { RectNodeDatum } from './barColumnSparkline';
import { BarColumnSparkline } from './barColumnSparkline';
interface ColumnNodeDatum extends RectNodeDatum {
}
export declare class ColumnSparkline extends BarColumnSparkline {
    protected updateYScaleRange(): void;
    protected updateXScaleRange(): void;
    protected updateAxisLine(): void;
    protected generateNodeData(): ColumnNodeDatum[] | undefined;
}
export {};
