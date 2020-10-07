"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xf_1 = require("./xf");
var cellXfsFactory = {
    getTemplate: function (xf) {
        return {
            name: "cellXfs",
            properties: {
                rawMap: {
                    count: xf.length
                }
            },
            children: xf.map(xf_1.default.getTemplate)
        };
    }
};
exports.default = cellXfsFactory;
//# sourceMappingURL=cellXfs.js.map