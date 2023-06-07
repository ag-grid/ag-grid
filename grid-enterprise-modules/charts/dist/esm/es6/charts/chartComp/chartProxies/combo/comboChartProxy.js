import { CartesianChartProxy } from "../cartesian/cartesianChartProxy";
import { getSeriesType } from "../../utils/seriesTypeMapper";
export class ComboChartProxy extends CartesianChartProxy {
    constructor(params) {
        super(params);
    }
    getAxes(params) {
        const fields = params ? params.fields : [];
        const fieldsMap = new Map(fields.map(f => [f.colId, f]));
        const { primaryYKeys, secondaryYKeys } = this.getYKeys(fields, params.seriesChartTypes);
        const axes = [
            {
                type: this.getXAxisType(params),
                position: 'bottom',
                gridStyle: [{ stroke: undefined }],
            },
        ];
        if (primaryYKeys.length > 0) {
            axes.push({
                type: 'number',
                keys: primaryYKeys,
                position: 'left',
            });
        }
        if (secondaryYKeys.length > 0) {
            secondaryYKeys.forEach((secondaryYKey, i) => {
                const field = fieldsMap.get(secondaryYKey);
                const secondaryAxisIsVisible = field && field.colId === secondaryYKey;
                if (!secondaryAxisIsVisible) {
                    return;
                }
                const secondaryAxisOptions = {
                    type: 'number',
                    keys: [secondaryYKey],
                    position: 'right',
                };
                const primaryYAxis = primaryYKeys.some(primaryYKey => !!fieldsMap.get(primaryYKey));
                const lastSecondaryAxis = i === secondaryYKeys.length - 1;
                if (!primaryYAxis && lastSecondaryAxis) {
                    // don't remove grid lines from the secondary axis closest to the chart, i.e. last supplied
                }
                else {
                    secondaryAxisOptions.gridStyle = [{ stroke: undefined }];
                }
                axes.push(secondaryAxisOptions);
            });
        }
        return axes;
    }
    getSeries(params) {
        const { fields, category, seriesChartTypes } = params;
        return fields.map(field => {
            const seriesChartType = seriesChartTypes.find(s => s.colId === field.colId);
            if (seriesChartType) {
                const chartType = seriesChartType.chartType;
                const grouped = ['groupedColumn', 'groupedBar'].includes(chartType);
                const groupedOpts = grouped ? { grouped: true } : {};
                return Object.assign({ type: getSeriesType(chartType), xKey: category.id, yKey: field.colId, yName: field.displayName, stacked: ['stackedArea', 'stackedColumn'].includes(chartType) }, groupedOpts);
            }
        });
    }
    getYKeys(fields, seriesChartTypes) {
        const primaryYKeys = [];
        const secondaryYKeys = [];
        fields.forEach(field => {
            const colId = field.colId;
            const seriesChartType = seriesChartTypes.find(s => s.colId === colId);
            if (seriesChartType) {
                seriesChartType.secondaryAxis ? secondaryYKeys.push(colId) : primaryYKeys.push(colId);
            }
        });
        return { primaryYKeys, secondaryYKeys };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYm9DaGFydFByb3h5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvY2hhcnRQcm94aWVzL2NvbWJvL2NvbWJvQ2hhcnRQcm94eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUN2RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFN0QsTUFBTSxPQUFPLGVBQWdCLFNBQVEsbUJBQW1CO0lBRXBELFlBQW1CLE1BQXdCO1FBQ3ZDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBRU0sT0FBTyxDQUFDLE1BQW9CO1FBQy9CLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzNDLE1BQU0sU0FBUyxHQUFHLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXpELE1BQU0sRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFFeEYsTUFBTSxJQUFJLEdBQTZCO1lBQ25DO2dCQUNJLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztnQkFDL0IsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLFNBQVMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxDQUFDO2FBQ3JDO1NBQ0osQ0FBQztRQUVGLElBQUksWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDekIsSUFBSSxDQUFD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