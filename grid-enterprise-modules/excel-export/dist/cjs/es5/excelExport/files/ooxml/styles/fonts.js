"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
            children: fonts.map(function (font) { return font_1.default.getTemplate(font); })
        };
    }
};
exports.default = fontsFactory;
