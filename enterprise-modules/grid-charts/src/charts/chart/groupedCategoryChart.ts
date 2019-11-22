import { CartesianChart } from "./cartesianChart";
import { numericExtent } from "../util/array";
import { GroupedCategoryAxis } from "./axis/groupedCategoryAxis";
import { ChartAxis, ChartAxisDirection, ChartAxisPosition } from "./chartAxis";
import { Series } from "./series/series";

export type GroupedCategoryChartAxis = GroupedCategoryAxis | ChartAxis;

export class GroupedCategoryChart extends CartesianChart {
    updateAxes() {
        const { axes } = this;

        axes.forEach(axis => {
            const { direction, boundSeries } = axis;
            const domains: any[][] = [];
            let isNumericX: boolean | undefined = undefined;
            boundSeries.filter(s => s.visible).forEach(series => {
                if (direction === ChartAxisDirection.X) {
                    if (isNumericX === undefined) {
                        // always add first X domain
                        const domain = series.getDomain(direction);
                        domains.push(domain);
                        isNumericX = typeof domain[0] === 'number';
                    } else if (isNumericX) {
                        // only add further X domains if the axis is numeric
                        domains.push(series.getDomain(direction));
                    }
                } else {
                    domains.push(series.getDomain(direction));
                }
            });
            const domain = new Array<any>().concat(...domains);
            axis.domain = numericExtent(domain) || domain;

            this.computeAxisAutopadding(axis);
            axis.update();
        });
    }

    computeAxisAutopadding(axis: ChartAxis) {
        const { position } = axis;
        const axisBBox = axis.computeBBox();

        // The bbox may not be valid if the axis has had zero updates so far.
        if (!axisBBox.isValid()) {
            return;
        }

        const axisThickness = Math.floor(axisBBox.width);

        switch (position) {
            case ChartAxisPosition.Left:
                if (this.axisAutoPadding.left !== axisThickness) {
                    this.axisAutoPadding.left = axisThickness;
                    this.layoutPending = true;
                }
                break;
            case ChartAxisPosition.Right:
                if (this.axisAutoPadding.right !== axisThickness) {
                    this.axisAutoPadding.right = axisThickness;
                    this.layoutPending = true;
                }
                break;
            case ChartAxisPosition.Bottom:
                if (this.axisAutoPadding.bottom !== axisThickness) {
                    this.axisAutoPadding.bottom = axisThickness;
                    this.layoutPending = true;
                }
                break;
            case ChartAxisPosition.Top:
                if (this.axisAutoPadding.top !== axisThickness) {
                    this.axisAutoPadding.top = axisThickness;
                    this.layoutPending = true;
                }
                break;
        }
    }
}
