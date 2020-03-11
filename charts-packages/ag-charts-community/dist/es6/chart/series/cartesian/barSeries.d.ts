import { ColumnSeries } from "./columnSeries";
export { CartesianTooltipRendererParams as BarTooltipRendererParams } from "../series";
export declare class BarSeries extends ColumnSeries {
    static className: string;
    static type: string;
    flipXY: boolean;
}
