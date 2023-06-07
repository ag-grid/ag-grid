import { ChartUpdateType } from './chartUpdateType';
var UpdateService = /** @class */ (function () {
    function UpdateService(updateCallback) {
        this.updateCallback = updateCallback;
    }
    UpdateService.prototype.update = function (type, _a) {
        if (type === void 0) { type = ChartUpdateType.FULL; }
        var _b = _a === void 0 ? {} : _a, _c = _b.forceNodeDataRefresh, forceNodeDataRefresh = _c === void 0 ? false : _c;
        this.updateCallback(type, { forceNodeDataRefresh: forceNodeDataRefresh });
    };
    return UpdateService;
}());
export { UpdateService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jaGFydC91cGRhdGVTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUlwRDtJQUdJLHVCQUFZLGNBQThCO1FBQ3RDLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO0lBQ3pDLENBQUM7SUFFTSw4QkFBTSxHQUFiLFVBQWMsSUFBMkIsRUFBRSxFQUFxQztRQUFsRSxxQkFBQSxFQUFBLE9BQU8sZUFBZSxDQUFDLElBQUk7WUFBRSxxQkFBbUMsRUFBRSxLQUFBLEVBQW5DLDRCQUE0QixFQUE1QixvQkFBb0IsbUJBQUcsS0FBSyxLQUFBO1FBQ3JFLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLEVBQUUsb0JBQW9CLHNCQUFBLEVBQUUsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFDTCxvQkFBQztBQUFELENBQUMsQUFWRCxJQVVDIn0=