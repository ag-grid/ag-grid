import { ChartUpdateType } from './chartUpdateType';
var UpdateService = /** @class */ (function () {
    function UpdateService(updateCallback) {
        this.updateCallback = updateCallback;
    }
    UpdateService.prototype.update = function (type) {
        if (type === void 0) { type = ChartUpdateType.FULL; }
        this.updateCallback(type);
    };
    return UpdateService;
}());
export { UpdateService };
