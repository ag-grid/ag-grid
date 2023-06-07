"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateService = void 0;
const chartUpdateType_1 = require("./chartUpdateType");
class UpdateService {
    constructor(updateCallback) {
        this.updateCallback = updateCallback;
    }
    update(type = chartUpdateType_1.ChartUpdateType.FULL, { forceNodeDataRefresh = false } = {}) {
        this.updateCallback(type, { forceNodeDataRefresh });
    }
}
exports.UpdateService = UpdateService;
