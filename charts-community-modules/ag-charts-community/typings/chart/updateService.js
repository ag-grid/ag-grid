"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateService = void 0;
var chartUpdateType_1 = require("./chartUpdateType");
var UpdateService = /** @class */ (function () {
    function UpdateService(updateCallback) {
        this.updateCallback = updateCallback;
    }
    UpdateService.prototype.update = function (type, _a) {
        if (type === void 0) { type = chartUpdateType_1.ChartUpdateType.FULL; }
        var _b = _a === void 0 ? {} : _a, _c = _b.forceNodeDataRefresh, forceNodeDataRefresh = _c === void 0 ? false : _c;
        this.updateCallback(type, { forceNodeDataRefresh: forceNodeDataRefresh });
    };
    return UpdateService;
}());
exports.UpdateService = UpdateService;
//# sourceMappingURL=updateService.js.map