"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCreator = void 0;
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
    BaseCreator.prototype.getData = function (params) {
        var serializingSession = this.createSerializingSession(params);
        var data = this.beans.gridSerializer.serialize(serializingSession, params);
        return data;
    };
    return BaseCreator;
}());
exports.BaseCreator = BaseCreator;
