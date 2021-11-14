import { BarColumnSparkline, RectNodeDatum } from './barColumnSparkline';
export interface BarNodeDatum extends RectNodeDatum {
}
export declare class BarSparkline extends BarColumnSparkline {
    static className: string;
    protected updateYScaleRange(): void;
    protected updateXScaleRange(): void;
    protected updateAxisLine(): void;
    protected generateNodeData(): BarNodeDatum[] | undefined;
}
