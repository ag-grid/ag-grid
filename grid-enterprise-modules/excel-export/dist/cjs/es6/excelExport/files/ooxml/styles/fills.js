"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fill_1 = require("./fill");
const fillsFactory = {
    getTemplate(fills) {
        return {
            name: "fills",
            properties: {
                rawMap: {
                    count: fills.length
                }
            },
            children: fills.map(fill => fill_1.default.getTemplate(fill))
        };
    }
};
exports.default = fillsFactory;
