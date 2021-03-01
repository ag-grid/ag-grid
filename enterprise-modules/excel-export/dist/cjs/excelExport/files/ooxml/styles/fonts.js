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
            children: fonts.map(font_1.default.getTemplate)
        };
    }
};
exports.default = fontsFactory;
//# sourceMappingURL=fonts.js.map