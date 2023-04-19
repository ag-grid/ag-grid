"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparklinesModule = void 0;
var core_1 = require("@ag-grid-community/core");
var core_2 = require("@ag-grid-enterprise/core");
var sparklineCellRenderer_1 = require("./sparklineCellRenderer");
var sparklineTooltipSingleton_1 = require("./tooltip/sparklineTooltipSingleton");
var version_1 = require("./version");
exports.SparklinesModule = {
    version: version_1.VERSION,
    moduleName: core_1.ModuleNames.SparklinesModule,
    beans: [sparklineTooltipSingleton_1.SparklineTooltipSingleton],
    userComponents: [{ componentName: 'agSparklineCellRenderer', componentClass: sparklineCellRenderer_1.SparklineCellRenderer }],
    dependantModules: [core_2.EnterpriseCoreModule],
};
