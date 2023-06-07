export var VALID_SERIES_TYPES = [
    'area',
    'bar',
    'column',
    'histogram',
    'line',
    'pie',
    'scatter',
];
export function getSeriesType(chartType) {
    switch (chartType) {
        case 'bar':
        case 'groupedBar':
        case 'stackedBar':
        case 'normalizedBar':
            return 'bar';
        case 'column':
        case 'groupedColumn':
        case 'stackedColumn':
        case 'normalizedColumn':
            return 'column';
        case 'line':
            return 'line';
        case 'area':
        case 'stackedArea':
        case 'normalizedArea':
            return 'area';
        case 'scatter':
        case 'bubble':
            return 'scatter';
        case 'histogram':
            return 'histogram';
        case 'pie':
        case 'doughnut':
            return 'pie';
        default:
            return 'cartesian';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWVzVHlwZU1hcHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL3V0aWxzL3Nlcmllc1R5cGVNYXBwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBaUJBLE1BQU0sQ0FBQyxJQUFNLGtCQUFrQixHQUFzQjtJQUNqRCxNQUFNO0lBQ04sS0FBSztJQUNMLFFBQVE7SUFDUixXQUFXO0lBQ1gsTUFBTTtJQUNOLEtBQUs7SUFDTCxTQUFTO0NBQ1osQ0FBQztBQUVGLE1BQU0sVUFBVSxhQUFhLENBQUMsU0FBb0I7SUFDOUMsUUFBUSxTQUFTLEVBQUU7UUFDZixLQUFLLEtBQUssQ0FBQztRQUNYLEtBQUssWUFBWSxDQUFDO1FBQ2xCLEtBQUssWUFBWSxDQUFDO1FBQ2xCLEtBQUssZUFBZTtZQUNoQixPQUFPLEtBQUssQ0FBQztRQUNqQixLQUFLLFFBQVEsQ0FBQztRQUNkLEtBQUssZUFBZSxDQUFDO1FBQ3JCLEtBQUssZUFBZSxDQUFDO1FBQ3JCLEtBQUssa0JBQWtCO1lBQ25CLE9BQU8sUUFBUSxDQUFDO1FBQ3BCLEtBQUssTUFBTTtZQUNQLE9BQU8sTUFBTSxDQUFDO1FBQ2xCLEtBQUssTUFBTSxDQUFDO1FBQ1osS0FBSyxhQUFhLENBQUM7UUFDbkIsS0FBSyxnQkFBZ0I7WUFDakIsT0FBTyxNQUFNLENBQUM7UUFDbEIsS0FBSyxTQUFTLENBQUM7UUFDZixLQUFLLFFBQVE7WUFDVCxPQUFPLFNBQVMsQ0FBQztRQUNyQixLQUFLLFdBQVc7WUFDWixPQUFPLFdBQVcsQ0FBQztRQUN2QixLQUFLLEtBQUssQ0FBQztRQUNYLEtBQUssVUFBVTtZQUNYLE9BQU8sS0FBSyxDQUFDO1FBQ2pCO1lBQ0ksT0FBTyxXQUFXLENBQUM7S0FDMUI7QUFDTCxDQUFDIn0=