"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCreator = void 0;
class BaseCreator {
    setBeans(beans) {
        this.beans = beans;
    }
    getFileName(fileName) {
        const extension = this.getDefaultFileExtension();
        if (fileName == null || !fileName.length) {
            fileName = this.getDefaultFileName();
        }
        return fileName.indexOf('.') === -1 ? `${fileName}.${extension}` : fileName;
    }
    getData(params) {
        const serializingSession = this.createSerializingSession(params);
        const data = this.beans.gridSerializer.serialize(serializingSession, params);
        return data;
    }
}
exports.BaseCreator = BaseCreator;
