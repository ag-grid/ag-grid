// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var font_1 = require("./font");
var fontsFactory = {
    getTemplate: function (fonts) {
        return {
            name: "fonts",
            properties: {
                rawMap: {
                    count: fonts.length
                }
            },
            children: ag_grid_community_1._.map(fonts, font_1.default.getTemplate)
        };
    }
};
exports.default = fontsFactory;
