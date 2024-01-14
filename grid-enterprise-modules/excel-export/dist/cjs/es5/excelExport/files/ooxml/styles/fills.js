"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fill_1 = require("./fill");
var fillsFactory = {
    getTemplate: function (fills) {
        return {
            name: "fills",
            properties: {
                rawMap: {
                    count: fills.length
                }
            },
            children: fills.map(function (fill) { return fill_1.default.getTemplate(fill); })
        };
    }
};
exports.default = fillsFactory;
