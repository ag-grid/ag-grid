import { ColumnSeries } from "./columnSeries";
import { reactive } from "../../../util/observable";

export { CartesianTooltipRendererParams as BarTooltipRendererParams } from "../series";

export class BarSeries extends ColumnSeries {
    @reactive(['layoutChange']) flipXY = true;
}