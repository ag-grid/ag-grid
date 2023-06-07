import { _ } from "@ag-grid-community/core";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { deepMerge } from "../../utils/object";
import { hexToRGBA } from "../../utils/color";
export class BarChartProxy extends CartesianChartProxy {
    constructor(params) {
        super(params);
    }
    getAxes(params) {
        const isBar = this.standaloneChartType === 'bar';
        const axes = [
            {
                type: this.getXAxisType(params),
                position: isBar ? 'left' : 'bottom',
            },
            {
                type: 'number',
                position: isBar ? 'bottom' : 'left',
            },
        ];
        // Add a default label formatter to show '%' for normalized charts if none is provided
        if (this.isNormalised()) {
            const numberAxis = axes[1];
            numberAxis.label = Object.assign(Object.assign({}, numberAxis.label), { formatter: (params) => Math.round(params.value) + '%' });
        }
        return axes;
    }
    getSeries(params) {
        const groupedCharts = ['groupedColumn', 'groupedBar'];
        const isGrouped = !this.crossFiltering && _.includes(groupedCharts, this.chartType);
        const series = params.fields.map(f => ({
            type: this.standaloneChartType,
            grouped: isGrouped,
            normalizedTo: this.isNormalised() ? 100 : undefined,
            xKey: params.category.id,
            xName: params.category.name,
            yKey: f.colId,
            yName: f.displayName
        }));
        return this.crossFiltering ? this.extractCrossFilterSeries(series) : series;
    }
    extractCrossFilterSeries(series) {
        const palette = this.getChartPalette();
        const updatePrimarySeries = (seriesOptions, index) => {
            return Object.assign(Object.assign({}, seriesOptions), { highlightStyle: { item: { fill: undefined } }, fill: palette === null || palette === void 0 ? void 0 : palette.fills[index], stroke: palette === null || palette === void 0 ? void 0 : palette.strokes[index], listeners: {
                    nodeClick: this.crossFilterCallback
                } });
        };
        const updateFilteredOutSeries = (seriesOptions) => {
            const yKey = seriesOptions.yKey + '-filtered-out';
            return Object.assign(Object.assign({}, deepMerge({}, seriesOptions)), { yKey, fill: hexToRGBA(seriesOptions.fill, '0.3'), stroke: hexToRGBA(seriesOptions.stroke, '0.3'), hideInLegend: [yKey] });
        };
        const allSeries = [];
        for (let i = 0; i < series.length; i++) {
            // update primary series
            const primarySeries = updatePrimarySeries(series[i], i);
            allSeries.push(primarySeries);
            // add 'filtered-out' series
            allSeries.push(updateFilteredOutSeries(primarySeries));
        }
        return allSeries;
    }
    isNormalised() {
        const normalisedCharts = ['normalizedColumn', 'normalizedBar'];
        return !this.crossFiltering && _.includes(normalisedCharts, this.chartType);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFyQ2hhcnRQcm94eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL2NoYXJ0UHJveGllcy9jYXJ0ZXNpYW4vYmFyQ2hhcnRQcm94eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsQ0FBQyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFHNUMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDNUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUU5QyxNQUFNLE9BQU8sYUFBYyxTQUFRLG1CQUFtQjtJQUVsRCxZQUFtQixNQUF3QjtRQUN2QyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQUVNLE9BQU8sQ0FBQyxNQUFvQjtRQUMvQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsbUJBQW1CLEtBQUssS0FBSyxDQUFDO1FBQ2pELE1BQU0sSUFBSSxHQUE2QjtZQUNuQztnQkFDSSxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7Z0JBQy9CLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUTthQUN0QztZQUNEO2dCQUNJLElBQUksRUFBRSxRQUFRO2dCQUNkLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTTthQUN0QztTQUNKLENBQUM7UUFDRixzRkFBc0Y7UUFDdEYsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUU7WUFDckIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNCLFVBQVUsQ0FBQyxLQUFLLG1DQUFRLFVBQVUsQ0FBQyxLQUFLLEtBQUUsU0FBUyxFQUFFLENBQUMsTUFBVyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUUsQ0FBQztTQUMxRztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTSxTQUFTLENBQUMsTUFBb0I7UUFDakMsTUFBTSxhQUFhLEdBQUcsQ0FBQyxlQUFlLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDdEQsTUFBTSxTQUFTLEdBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVwRixNQUFNLE1BQU0sR0FBeUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUN4RDtZQUNJLElBQUksRUFBRSxJQUFJLENBQUMsbUJBQW1CO1lBQzlCLE9BQU8sRUFBRSxTQUFTO1lBQ2xCLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUztZQUNuRCxJQUFJLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3hCLEtBQUssRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUk7WUFDM0IsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLO1lBQ2IsS0FBSyxFQUFFLENBQUMsQ0FBQyxXQUFXO1NBRTNCLENBQUEsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNoRixDQUFDO0lBRU8sd0JBQXdCLENBQUMsTUFBNEI7UUFDekQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBRXZDLE1BQU0sbUJBQW1CLEdBQUcsQ0FBQyxhQUFpQyxFQUFFLEtBQWEsRUFBRSxFQUFFO1lBQzdFLHVDQUNPLGFBQWEsS0FDaEIsY0FBYyxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQzdDLElBQUksRUFBRSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUMzQixNQUFNLEVBQUUsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFDL0IsU0FBUyxFQUFFO29CQUNQLFNBQVMsRUFBRSxJQUFJLENBQUMsbUJBQW1CO2lCQUN0QyxJQUNKO1FBQ0wsQ0FBQyxDQUFBO1FBRUQsTUFBTSx1QkFBdUIsR0FBRyxDQUFDLGFBQWlDLEVBQXNCLEVBQUU7WUFDdEYsTUFBTSxJQUFJLEdBQUcsYUFBYSxDQUFDLElBQUksR0FBRyxlQUFlLENBQUM7WUFDbEQsdUNBQ08sU0FBUyxDQUFDLEVBQUUsRUFBRSxhQUFhLENBQUMsS0FDL0IsSUFBSSxFQUNKLElBQUksRUFBRSxTQUFTLENBQUMsYUFBYSxDQUFDLElBQUssRUFBRSxLQUFLLENBQUMsRUFDM0MsTUFBTSxFQUFFLFNBQVMsQ0FBQyxhQUFhLENBQUMsTUFBTyxFQUFFLEtBQUssQ0FBQyxFQUMvQyxZQUFZLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFDdkI7UUFDTCxDQUFDLENBQUE7UUFFRCxNQUFNLFNBQVMsR0FBeUIsRUFBRSxDQUFDO1FBQzNDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3BDLHdCQUF3QjtZQUN4QixNQUFNLGFBQWEsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEQsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUU5Qiw0QkFBNEI7WUFDNUIsU0FBUyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1NBQzFEO1FBQ0QsT0FBTyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUVPLFlBQVk7UUFDaEIsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLGtCQUFrQixFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQy9ELE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7Q0FDSiJ9