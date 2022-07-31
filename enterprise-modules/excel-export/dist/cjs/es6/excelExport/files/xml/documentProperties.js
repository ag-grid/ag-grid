"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const documentProperties = {
    getTemplate() {
        return {
            name: "DocumentProperties",
            properties: {
                rawMap: {
                    xmlns: "urn:schemas-microsoft-com:office:office"
                }
            },
            children: [{
                    name: "Version",
                    textNode: "12.00"
                }]
        };
    }
};
exports.default = documentProperties;
