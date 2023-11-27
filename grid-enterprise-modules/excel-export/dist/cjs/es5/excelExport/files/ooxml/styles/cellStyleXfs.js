"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xf_1 = require("./xf");
var cellStylesXfsFactory = {
    getTemplate: function (xfs) {
        return {
            name: "cellStyleXfs",
            properties: {
                rawMap: {
                    count: xfs.length
                }
            },
            children: xfs.map(function (xf) { return xf_1.default.getTemplate(xf); })
        };
    }
};
exports.default = cellStylesXfsFactory;
