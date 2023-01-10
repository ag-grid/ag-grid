"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterpriseCoreModule = exports.WatermarkComp = exports.MD5 = exports.LicenseManager = void 0;
var core_1 = require("@ag-grid-community/core");
var licenseManager_1 = require("./licenseManager");
var md5_1 = require("./license/md5");
var watermark_1 = require("./license/watermark");
var licenseManager_2 = require("./licenseManager");
Object.defineProperty(exports, "LicenseManager", { enumerable: true, get: function () { return licenseManager_2.LicenseManager; } });
var md5_2 = require("./license/md5");
Object.defineProperty(exports, "MD5", { enumerable: true, get: function () { return md5_2.MD5; } });
var watermark_2 = require("./license/watermark");
Object.defineProperty(exports, "WatermarkComp", { enumerable: true, get: function () { return watermark_2.WatermarkComp; } });
var version_1 = require("./version");
exports.EnterpriseCoreModule = {
    version: version_1.VERSION,
    moduleName: core_1.ModuleNames.EnterpriseCoreModule,
    beans: [licenseManager_1.LicenseManager, md5_1.MD5],
    agStackComponents: [
        { componentName: 'AgWatermark', componentClass: watermark_1.WatermarkComp }
    ]
};
