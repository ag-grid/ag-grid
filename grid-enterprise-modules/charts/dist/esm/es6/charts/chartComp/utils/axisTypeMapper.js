export const ALL_AXIS_TYPES = ['number', 'category', 'groupedCategory', 'log', 'time'];
export function getLegacyAxisType(chartType) {
    switch (chartType) {
        case 'bar':
        case 'stackedBar':
        case 'normalizedBar':
            return ['number', 'category'];
        case 'groupedBar':
            return ['number', 'groupedCategory'];
        case 'column':
        case 'stackedColumn':
        case 'normalizedColumn':
        case 'line':
        case 'area':
        case 'stackedArea':
        case 'normalizedArea':
        case 'histogram':
            return ['category', 'number'];
        case 'groupedColumn':
            return ['groupedCategory', 'number'];
        case 'scatter':
        case 'bubble':
            return ['number', 'number'];
        default:
            return undefined;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXhpc1R5cGVNYXBwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC91dGlscy9heGlzVHlwZU1hcHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQTBCLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFFOUcsTUFBTSxVQUFVLGlCQUFpQixDQUFDLFNBQW9CO0lBQ2xELFFBQVEsU0FBUyxFQUFFO1FBQ2YsS0FBSyxLQUFLLENBQUM7UUFDWCxLQUFLLFlBQVksQ0FBQztRQUNsQixLQUFLLGVBQWU7WUFDaEIsT0FBTyxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNsQyxLQUFLLFlBQVk7WUFDYixPQUFPLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDekMsS0FBSyxRQUFRLENBQUM7UUFDZCxLQUFLLGVBQWUsQ0FBQztRQUNyQixLQUFLLGtCQUFrQixDQUFDO1FBQ3hCLEtBQUssTUFBTSxDQUFDO1FBQ1osS0FBSyxNQUFNLENBQUM7UUFDWixLQUFLLGFBQWEsQ0FBQztRQUNuQixLQUFLLGdCQUFnQixDQUFDO1FBQ3RCLEtBQUssV0FBVztZQUNaLE9BQU8sQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDbEMsS0FBSyxlQUFlO1lBQ2hCLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN6QyxLQUFLLFNBQVMsQ0FBQztRQUNmLEtBQUssUUFBUTtZQUNULE9BQU8sQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDaEM7WUFDSSxPQUFPLFNBQVMsQ0FBQztLQUN4QjtBQUNMLENBQUMifQ==