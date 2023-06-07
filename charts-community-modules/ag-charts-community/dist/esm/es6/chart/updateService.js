import { ChartUpdateType } from './chartUpdateType';
export class UpdateService {
    constructor(updateCallback) {
        this.updateCallback = updateCallback;
    }
    update(type = ChartUpdateType.FULL, { forceNodeDataRefresh = false } = {}) {
        this.updateCallback(type, { forceNodeDataRefresh });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jaGFydC91cGRhdGVTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUlwRCxNQUFNLE9BQU8sYUFBYTtJQUd0QixZQUFZLGNBQThCO1FBQ3RDLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO0lBQ3pDLENBQUM7SUFFTSxNQUFNLENBQUMsSUFBSSxHQUFHLGVBQWUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxvQkFBb0IsR0FBRyxLQUFLLEVBQUUsR0FBRyxFQUFFO1FBQzVFLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLEVBQUUsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDO0lBQ3hELENBQUM7Q0FDSiJ9