import { NumberAxis } from '../axis/numberAxis';
import { CategoryAxis } from '../axis/categoryAxis';
export var DEFAULT_CARTESIAN_CHART_OVERRIDES = {
    axes: [
        {
            type: NumberAxis.type,
            position: 'left',
        },
        {
            type: CategoryAxis.type,
            position: 'bottom',
        },
    ],
};
export var DEFAULT_BAR_CHART_OVERRIDES = {
    axes: [
        {
            type: 'number',
            position: 'bottom',
        },
        {
            type: 'category',
            position: 'left',
        },
    ],
};
export var DEFAULT_SCATTER_HISTOGRAM_CHART_OVERRIDES = {
    axes: [
        {
            type: 'number',
            position: 'bottom',
        },
        {
            type: 'number',
            position: 'left',
        },
    ],
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnQvbWFwcGluZy9kZWZhdWx0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDaEQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBSXBELE1BQU0sQ0FBQyxJQUFNLGlDQUFpQyxHQUE0QjtJQUN0RSxJQUFJLEVBQUU7UUFDRjtZQUNJLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSTtZQUNyQixRQUFRLEVBQUUsTUFBTTtTQUNuQjtRQUNEO1lBQ0ksSUFBSSxFQUFFLFlBQVksQ0FBQyxJQUFJO1lBQ3ZCLFFBQVEsRUFBRSxRQUFRO1NBQ3JCO0tBQ0o7Q0FDSixDQUFDO0FBRUYsTUFBTSxDQUFDLElBQU0sMkJBQTJCLEdBQTRCO0lBQ2hFLElBQUksRUFBRTtRQUNGO1lBQ0ksSUFBSSxFQUFFLFFBQVE7WUFDZCxRQUFRLEVBQUUsUUFBUTtTQUNyQjtRQUNEO1lBQ0ksSUFBSSxFQUFFLFVBQVU7WUFDaEIsUUFBUSxFQUFFLE1BQU07U0FDbkI7S0FDSjtDQUNKLENBQUM7QUFFRixNQUFNLENBQUMsSUFBTSx5Q0FBeUMsR0FBNEI7SUFDOUUsSUFBSSxFQUFFO1FBQ0Y7WUFDSSxJQUFJLEVBQUUsUUFBUTtZQUNkLFFBQVEsRUFBRSxRQUFRO1NBQ3JCO1FBQ0Q7WUFDSSxJQUFJLEVBQUUsUUFBUTtZQUNkLFFBQVEsRUFBRSxNQUFNO1NBQ25CO0tBQ0o7Q0FDSixDQUFDIn0=