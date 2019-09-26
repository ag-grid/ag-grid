// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var relationship_1 = require("./relationship");
var relationshipsFactory = {
    getTemplate: function (c) {
        var children = ag_grid_community_1._.map(c, relationship_1.default.getTemplate);
        return {
            name: "Relationships",
            properties: {
                rawMap: {
                    xmlns: "http://schemas.openxmlformats.org/package/2006/relationships"
                }
            },
            children: children
        };
    }
};
exports.default = relationshipsFactory;
