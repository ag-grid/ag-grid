"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var BaseCreator = /** @class */ (function () {
    function BaseCreator() {
    }
    BaseCreator.prototype.setBeans = function (beans) {
        this.beans = beans;
    };
    BaseCreator.prototype.getFileName = function (fileName) {
        var extension = this.getDefaultFileExtension();
        if (fileName == null || !fileName.length) {
            fileName = this.getDefaultFileName();
        }
        return fileName.indexOf('.') === -1 ? fileName + "." + extension : fileName;
    };
    BaseCreator.prototype.getMergedParamsAndData = function (userParams) {
        var mergedParams = this.mergeDefaultParams(userParams);
        var data = this.beans.gridSerializer.serialize(this.createSerializingSession(mergedParams), mergedParams);
        return { mergedParams: mergedParams, data: data };
    };
    BaseCreator.prototype.mergeDefaultParams = function (userParams) {
        var baseParams = this.getDefaultExportParams();
        var params = {};
        core_1._.assign(params, baseParams);
        core_1._.assign(params, userParams);
        return params;
    };
    return BaseCreator;
}());
exports.BaseCreator = BaseCreator;
//# sourceMappingURL=baseCreator.js.map