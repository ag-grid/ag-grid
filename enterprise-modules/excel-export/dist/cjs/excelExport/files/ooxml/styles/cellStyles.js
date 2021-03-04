"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cellStyle_1 = require("./cellStyle");
var cellStylesFactory = {
    getTemplate: function (cellStyles) {
        return {
            name: "cellStyles",
            properties: {
                rawMap: {
                    count: cellStyles.length
                }
            },
            children: cellStyles.map(cellStyle_1.default.getTemplate)
        };
    }
};
exports.default = cellStylesFactory;
//# sourceMappingURL=cellStyles.js.map