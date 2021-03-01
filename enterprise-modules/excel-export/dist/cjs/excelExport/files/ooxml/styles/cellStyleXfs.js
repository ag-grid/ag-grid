"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xf_1 = require("./xf");
var cellStylesXfsFactory = {
    getTemplate: function (xf) {
        return {
            name: "cellStyleXfs",
            properties: {
                rawMap: {
                    count: xf.length
                }
            },
            children: xf.map(xf_1.default.getTemplate)
        };
    }
};
exports.default = cellStylesXfsFactory;
//# sourceMappingURL=cellStyleXfs.js.map