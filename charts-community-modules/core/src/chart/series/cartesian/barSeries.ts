import { ColumnSeries } from "./columnSeries";
import { reactive } from "../../../util/observable";
import { chainObjects } from "../../../util/object";

export { CartesianTooltipRendererParams as BarTooltipRendererParams } from "../series";

export class BarSeries extends ColumnSeries {

    static className = 'BarSeries';

    static defaults = chainObjects(ColumnSeries.defaults, {
        flipXY: true
    });

    @reactive('layoutChange') flipXY = BarSeries.defaults.flipXY;
}
