"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartUpdateType = void 0;
/** Types of chart-update, in pipeline execution order. */
var ChartUpdateType;
(function (ChartUpdateType) {
    ChartUpdateType[ChartUpdateType["FULL"] = 0] = "FULL";
    ChartUpdateType[ChartUpdateType["PROCESS_DATA"] = 1] = "PROCESS_DATA";
    ChartUpdateType[ChartUpdateType["PERFORM_LAYOUT"] = 2] = "PERFORM_LAYOUT";
    ChartUpdateType[ChartUpdateType["SERIES_UPDATE"] = 3] = "SERIES_UPDATE";
    ChartUpdateType[ChartUpdateType["TOOLTIP_RECALCULATION"] = 4] = "TOOLTIP_RECALCULATION";
    ChartUpdateType[ChartUpdateType["SCENE_RENDER"] = 5] = "SCENE_RENDER";
    ChartUpdateType[ChartUpdateType["NONE"] = 6] = "NONE";
})(ChartUpdateType = exports.ChartUpdateType || (exports.ChartUpdateType = {}));
//# sourceMappingURL=chartUpdateType.js.map