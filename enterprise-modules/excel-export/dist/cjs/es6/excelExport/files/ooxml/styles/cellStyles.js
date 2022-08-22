"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cellStyle_1 = require("./cellStyle");
const cellStylesFactory = {
    getTemplate(cellStyles) {
        return {
            name: "cellStyles",
            properties: {
                rawMap: {
                    count: cellStyles.length
                }
            },
            children: cellStyles.map(cellStyle => cellStyle_1.default.getTemplate(cellStyle))
        };
    }
};
exports.default = cellStylesFactory;
