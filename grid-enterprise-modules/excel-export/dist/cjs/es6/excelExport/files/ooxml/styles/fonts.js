"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const font_1 = require("./font");
const fontsFactory = {
    getTemplate(fonts) {
        return {
            name: "fonts",
            properties: {
                rawMap: {
                    count: fonts.length
                }
            },
            children: fonts.map(font => font_1.default.getTemplate(font))
        };
    }
};
exports.default = fontsFactory;
