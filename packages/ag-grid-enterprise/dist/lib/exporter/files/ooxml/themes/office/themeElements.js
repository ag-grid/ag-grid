// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var colorScheme_1 = require("./colorScheme");
var fontScheme_1 = require("./fontScheme");
var formatScheme_1 = require("./formatScheme");
var themeElements = {
    getTemplate: function () {
        return {
            name: "a:themeElements",
            children: [
                colorScheme_1.default.getTemplate(),
                fontScheme_1.default.getTemplate(),
                formatScheme_1.default.getTemplate()
            ]
        };
    }
};
exports.default = themeElements;
