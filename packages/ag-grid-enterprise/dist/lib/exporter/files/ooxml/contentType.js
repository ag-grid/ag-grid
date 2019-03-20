// ag-grid-enterprise v20.2.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var contentTypeFactory = {
    getTemplate: function (config) {
        var name = config.name, ContentType = config.ContentType, Extension = config.Extension, PartName = config.PartName;
        return {
            name: name,
            properties: {
                rawMap: {
                    Extension: Extension,
                    PartName: PartName,
                    ContentType: ContentType
                }
            }
        };
    }
};
exports.default = contentTypeFactory;
