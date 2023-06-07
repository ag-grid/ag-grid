import { CartesianChartProxy } from "./cartesianChartProxy";
export class HistogramChartProxy extends CartesianChartProxy {
    constructor(params) {
        super(params);
    }
    getSeries(params) {
        const firstField = params.fields[0]; // multiple series are not supported!
        return [
            {
                type: this.standaloneChartType,
                xKey: firstField.colId,
                xName: firstField.displayName,
                yName: this.chartProxyParams.translate("histogramFrequency"),
                areaPlot: false, // only constant width is supported via integrated charts
            }
        ];
    }
    getAxes(_params) {
        return [
            {
                type: 'number',
                position: 'bottom',
            },
            {
                type: 'number',
                position: 'left',
            },
        ];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlzdG9ncmFtQ2hhcnRQcm94eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL2NoYXJ0UHJveGllcy9jYXJ0ZXNpYW4vaGlzdG9ncmFtQ2hhcnRQcm94eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUU1RCxNQUFNLE9BQU8sbUJBQW9CLFNBQVEsbUJBQW1CO0lBRXhELFlBQW1CLE1BQXdCO1FBQ3ZDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBRU0sU0FBUyxDQUFDLE1BQW9CO1FBQ2pDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxxQ0FBcUM7UUFDMUUsT0FBTztZQUNIO2dCQUNJLElBQUksRUFBRSxJQUFJLENBQUMsbUJBQW1CO2dCQUM5QixJQUFJLEVBQUUsVUFBVSxDQUFDLEtBQUs7Z0JBQ3RCLEtBQUssRUFBRSxVQUFVLENBQUMsV0FBVztnQkFDN0IsS0FBSyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUM7Z0JBQzVELFFBQVEsRUFBRSxLQUFLLEVBQUUseURBQXlEO2FBQ2pEO1NBQ2hDLENBQUM7SUFDTixDQUFDO0lBRU0sT0FBTyxDQUFDLE9BQXFCO1FBQ2hDLE9BQU87WUFDSDtnQkFDSSxJQUFJLEVBQUUsUUFBUTtnQkFDZCxRQUFRLEVBQUUsUUFBUTthQUNyQjtZQUNEO2dCQUNJLElBQUksRUFBRSxRQUFRO2dCQUNkLFFBQVEsRUFBRSxNQUFNO2FBQ25CO1NBQ0osQ0FBQztJQUNOLENBQUM7Q0FFSiJ9