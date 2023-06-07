import { CartesianChartProxy } from "./cartesianChartProxy";
export class LineChartProxy extends CartesianChartProxy {
    constructor(params) {
        super(params);
    }
    getAxes(params) {
        return [
            {
                type: this.getXAxisType(params),
                position: 'bottom'
            },
            {
                type: 'number',
                position: 'left'
            },
        ];
    }
    getSeries(params) {
        const series = params.fields.map(f => ({
            type: this.standaloneChartType,
            xKey: params.category.id,
            xName: params.category.name,
            yKey: f.colId,
            yName: f.displayName
        }));
        return this.crossFiltering ? this.extractLineAreaCrossFilterSeries(series, params) : series;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZUNoYXJ0UHJveHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9jaGFydFByb3hpZXMvY2FydGVzaWFuL2xpbmVDaGFydFByb3h5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRTVELE1BQU0sT0FBTyxjQUFlLFNBQVEsbUJBQW1CO0lBRW5ELFlBQW1CLE1BQXdCO1FBQ3ZDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBRU0sT0FBTyxDQUFDLE1BQW9CO1FBQy9CLE9BQU87WUFDSDtnQkFDSSxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7Z0JBQy9CLFFBQVEsRUFBRSxRQUFRO2FBQ3JCO1lBQ0Q7Z0JBQ0ksSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsUUFBUSxFQUFFLE1BQU07YUFDbkI7U0FDSixDQUFDO0lBQ04sQ0FBQztJQUVNLFNBQVMsQ0FBQyxNQUFvQjtRQUNqQyxNQUFNLE1BQU0sR0FBMEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUN6RDtZQUNJLElBQUksRUFBRSxJQUFJLENBQUMsbUJBQW1CO1lBQzlCLElBQUksRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDeEIsS0FBSyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSTtZQUMzQixJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUs7WUFDYixLQUFLLEVBQUUsQ0FBQyxDQUFDLFdBQVc7U0FFM0IsQ0FBQSxDQUFDLENBQUM7UUFFSCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNoRyxDQUFDO0NBQ0oifQ==