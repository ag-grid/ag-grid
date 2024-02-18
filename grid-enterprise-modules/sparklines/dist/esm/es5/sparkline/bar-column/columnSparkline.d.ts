import { BarColumnSparkline, RectNodeDatum } from './barColumnSparkline';
interface ColumnNodeDatum extends RectNodeDatum {
}
export declare class ColumnSparkline extends BarColumnSparkline {
    static className: string;
    protected updateYScaleRange(): void;
    protected updateXScaleRange(): void;
    protected updateAxisLine(): void;
    protected generateNodeData(): ColumnNodeDatum[] | undefined;
}
export {};
