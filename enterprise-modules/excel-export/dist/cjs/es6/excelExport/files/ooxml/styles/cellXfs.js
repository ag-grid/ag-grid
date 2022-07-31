"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xf_1 = require("./xf");
const cellXfsFactory = {
    getTemplate(xfs) {
        return {
            name: "cellXfs",
            properties: {
                rawMap: {
                    count: xfs.length
                }
            },
            children: xfs.map(xf => xf_1.default.getTemplate(xf))
        };
    }
};
exports.default = cellXfsFactory;
