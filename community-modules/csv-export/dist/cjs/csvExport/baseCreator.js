"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var BaseCreator = /** @class */ (function () {
    function BaseCreator() {
    }
    BaseCreator.prototype.setBeans = function (beans) {
        this.beans = beans;
    };
    BaseCreator.prototype.export = function (userParams) {
        if (this.isExportSuppressed()) {
            console.warn("ag-grid: Export cancelled. Export is not allowed as per your configuration.");
            return '';
        }
        var _a = this.getMergedParamsAndData(userParams), mergedParams = _a.mergedParams, data = _a.data;
        var fileNamePresent = mergedParams && mergedParams.fileName && mergedParams.fileName.length !== 0;
        var fileName = fileNamePresent ? mergedParams.fileName : this.getDefaultFileName();
        if (fileName.indexOf(".") === -1) {
            fileName = fileName + "." + this.getDefaultFileExtension();
        }
        this.beans.downloader.download(fileName, this.packageFile(data));
        return data;
    };
    BaseCreator.prototype.getData = function (params) {
        return this.getMergedParamsAndData(params).data;
    };
    BaseCreator.prototype.getMergedParamsAndData = function (userParams) {
        var mergedParams = this.mergeDefaultParams(userParams);
        var data = this.beans.gridSerializer.serialize(this.createSerializingSession(mergedParams), mergedParams);
        return { mergedParams: mergedParams, data: data };
    };
    BaseCreator.prototype.mergeDefaultParams = function (userParams) {
        var baseParams = this.beans.gridOptionsWrapper.getDefaultExportParams();
        var params = {};
        core_1._.assign(params, baseParams);
        core_1._.assign(params, userParams);
        return params;
    };
    BaseCreator.prototype.packageFile = function (data) {
        return new Blob(["\ufeff", data], {
            // @ts-ignore
            type: window.navigator.msSaveOrOpenBlob ? this.getMimeType() : 'octet/stream'
        });
    };
    return BaseCreator;
}());
exports.BaseCreator = BaseCreator;
//# sourceMappingURL=baseCreator.js.map