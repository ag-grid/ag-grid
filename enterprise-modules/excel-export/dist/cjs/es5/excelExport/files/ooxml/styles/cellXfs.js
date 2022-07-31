"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xf_1 = require("./xf");
var cellXfsFactory = {
    getTemplate: function (xfs) {
        return {
            name: "cellXfs",
            properties: {
                rawMap: {
                    count: xfs.length
                }
            },
            children: xfs.map(function (xf) { return xf_1.default.getTemplate(xf); })
        };
    }
};
exports.default = cellXfsFactory;
