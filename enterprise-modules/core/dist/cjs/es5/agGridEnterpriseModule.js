"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var licenseManager_1 = require("./licenseManager");
var md5_1 = require("./license/md5");
var watermark_1 = require("./license/watermark");
var licenseManager_2 = require("./licenseManager");
exports.LicenseManager = licenseManager_2.LicenseManager;
var md5_2 = require("./license/md5");
exports.MD5 = md5_2.MD5;
var watermark_2 = require("./license/watermark");
exports.WatermarkComp = watermark_2.WatermarkComp;
exports.EnterpriseCoreModule = {
    moduleName: core_1.ModuleNames.EnterpriseCoreModule,
    beans: [licenseManager_1.LicenseManager, md5_1.MD5],
    agStackComponents: [
        { componentName: 'AgWatermark', componentClass: watermark_1.WatermarkComp }
    ]
};
//# sourceMappingURL=agGridEnterpriseModule.js.map