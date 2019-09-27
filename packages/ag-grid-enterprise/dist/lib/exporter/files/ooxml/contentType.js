// ag-grid-enterprise v21.2.2
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
