"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contentTypeFactory = {
    getTemplate(config) {
        const { name, ContentType, Extension, PartName } = config;
        return {
            name,
            properties: {
                rawMap: {
                    Extension,
                    PartName,
                    ContentType
                }
            }
        };
    }
};
exports.default = contentTypeFactory;
