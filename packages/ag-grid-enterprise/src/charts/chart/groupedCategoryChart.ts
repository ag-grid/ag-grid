import { CartesianChartLayout, CartesianChart, CartesianChartOptions } from "./cartesianChart";
import { Axis } from "../axis";
import Scale from "../scale/scale";
import { numericExtent } from "../util/array";
import { GroupedCategoryAxis } from "./axis/groupedCategoryAxis";

export type GroupedCategoryChartAxis = GroupedCategoryAxis | Axis<Scale<any, number>>;
export interface GroupedCategoryChartOptions extends CartesianChartOptions<GroupedCategoryChartAxis, GroupedCategoryChartAxis> {
}

export class GroupedCategoryChart extends CartesianChart<GroupedCategoryChartAxis, GroupedCategoryChartAxis> {
    constructor(options: GroupedCategoryChartOptions) {
        super(options);
    }

    updateAxes() {
        const isHorizontal = this.layout === CartesianChartLayout.Horizontal;
        const xAxis = isHorizontal ? this.yAxis : this.xAxis;
        const yAxis = isHorizontal ? this.xAxis : this.yAxis;

        if (!(xAxis && yAxis)) {
            return;
        }

        const xDomains: any[][] = [];
        const yDomains: any[][] = [];

        let isNumericXAxis: boolean | undefined = undefined;

        this.series.filter(s => s.visible).forEach(series => {
            const xDomain = series.getDomainX();

            if (isNumericXAxis === undefined) {
                // always add first X domain
                xDomains.push(xDomain);
                isNumericXAxis = typeof xDomain[0] === 'number';
            } else if (isNumericXAxis) {
                // only add further X domains if the axis is numeric
                xDomains.push(xDomain);
            }

            yDomains.push(series.getDomainY());
        });

        const xDomain = new Array<any>().concat(...xDomains);
        const yDomain = new Array<any>().concat(...yDomains);

        xAxis.domain = numericExtent(xDomain) || xDomain;
        yAxis.domain = numericExtent(yDomain) || yDomain;

        xAxis.update();
        yAxis.update();

        // The `xAxis` and `yAxis` have `.this` prefix on purpose here,
        // because the local `xAxis` and `yAxis` variables may be swapped.
        const xAxisBBox = this.xAxis.getBBox();
        const yAxisBBox = this.yAxis.getBBox();

        {
            const axisThickness = Math.floor(yAxisBBox.width);
            if (this.axisAutoPadding.left !== axisThickness) {
                this.axisAutoPadding.left = axisThickness;
                this.layoutPending = true;
            }
        }
        {
            const axisThickness = Math.floor(isHorizontal ? xAxisBBox.width : xAxisBBox.height);
            if (this.axisAutoPadding.bottom !== axisThickness) {
                this.axisAutoPadding.bottom = axisThickness;
                this.layoutPending = true;
            }
        }
    }
}
