export class BaseCreator {
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
        return this.beans.gridSerializer.serialize(serializingSession, params);
    }
    getDefaultFileName() {
        return `export.${this.getDefaultFileExtension()}`;
    }
}
