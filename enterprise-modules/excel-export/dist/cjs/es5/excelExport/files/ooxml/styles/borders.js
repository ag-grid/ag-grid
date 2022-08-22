"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var border_1 = require("./border");
var bordersFactory = {
    getTemplate: function (borders) {
        return {
            name: "borders",
            properties: {
                rawMap: {
                    count: borders.length
                }
            },
            children: borders.map(function (border) { return border_1.default.getTemplate(border); })
        };
    }
};
exports.default = bordersFactory;
