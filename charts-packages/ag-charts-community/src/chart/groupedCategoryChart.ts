import { CartesianChart } from "./cartesianChart";
import { numericExtent } from "../util/array";
import { GroupedCategoryAxis } from "./axis/groupedCategoryAxis";
import { ChartAxis, ChartAxisDirection } from "./chartAxis";

export type GroupedCategoryChartAxis = GroupedCategoryAxis | ChartAxis;

export class GroupedCategoryChart extends CartesianChart {
    static className = 'GroupedCategoryChart';
    static type = 'groupedCategory';

    updateAxes() {
        this.axes.forEach(axis => {
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

            axis.update();
        });
    }
}
