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
            children: fills.map(fill_1.default.getTemplate)
        };
    }
};
exports.default = fillsFactory;
//# sourceMappingURL=fills.js.map