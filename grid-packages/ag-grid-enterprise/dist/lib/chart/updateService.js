"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateService = void 0;
var chartUpdateType_1 = require("./chartUpdateType");
var UpdateService = /** @class */ (function () {
    function UpdateService(updateCallback) {
        this.updateCallback = updateCallback;
    }
    UpdateService.prototype.update = function (type) {
        if (type === void 0) { type = chartUpdateType_1.ChartUpdateType.FULL; }
        this.updateCallback(type);
    };
    return UpdateService;
}());
exports.UpdateService = UpdateService;
//# sourceMappingURL=updateService.js.map