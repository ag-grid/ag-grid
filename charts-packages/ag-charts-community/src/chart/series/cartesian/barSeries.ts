import { ColumnSeries } from "./columnSeries";
import { reactive } from "../../../util/observable";

export { CartesianTooltipRendererParams as BarTooltipRendererParams } from "../series";

export class BarSeries extends ColumnSeries {

    static className = 'BarSeries';
    static type = 'bar';

    @reactive('layoutChange') flipXY = true;
}
