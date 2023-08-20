"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cell_1 = require("./cell");
const row = {
    getTemplate(r) {
        const { cells } = r;
        return {
            name: "Row",
            children: cells.map(it => cell_1.default.getTemplate(it))
        };
    }
};
exports.default = row;
