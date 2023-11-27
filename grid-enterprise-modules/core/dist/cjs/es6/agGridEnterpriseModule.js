"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterpriseCoreModule = exports.WatermarkComp = void 0;
const core_1 = require("@ag-grid-community/core");
const gridLicenseManager_1 = require("./license/gridLicenseManager");
const watermark_1 = require("./license/watermark");
var watermark_2 = require("./license/watermark");
Object.defineProperty(exports, "WatermarkComp", { enumerable: true, get: function () { return watermark_2.WatermarkComp; } });
const version_1 = require("./version");
exports.EnterpriseCoreModule = {
    version: version_1.VERSION,
    moduleName: core_1.ModuleNames.EnterpriseCoreModule,
    beans: [gridLicenseManager_1.GridLicenseManager],
    agStackComponents: [
        { componentName: 'AgWatermark', componentClass: watermark_1.WatermarkComp }
    ]
};
