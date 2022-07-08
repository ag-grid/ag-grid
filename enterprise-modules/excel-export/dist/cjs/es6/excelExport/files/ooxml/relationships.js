"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const relationship_1 = require("./relationship");
const relationshipsFactory = {
    getTemplate(c) {
        const children = c.map(relationship => relationship_1.default.getTemplate(relationship));
        return {
            name: "Relationships",
            properties: {
                rawMap: {
                    xmlns: "http://schemas.openxmlformats.org/package/2006/relationships"
                }
            },
            children
        };
    }
};
exports.default = relationshipsFactory;
