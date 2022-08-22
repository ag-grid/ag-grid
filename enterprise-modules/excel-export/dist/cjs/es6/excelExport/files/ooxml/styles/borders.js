"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const border_1 = require("./border");
const bordersFactory = {
    getTemplate(borders) {
        return {
            name: "borders",
            properties: {
                rawMap: {
                    count: borders.length
                }
            },
            children: borders.map(border => border_1.default.getTemplate(border))
        };
    }
};
exports.default = bordersFactory;
