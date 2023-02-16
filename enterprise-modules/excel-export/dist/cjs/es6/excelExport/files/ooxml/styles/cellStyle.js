"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const borderFactory = {
    getTemplate(cellStyle) {
        const { builtinId, name, xfId } = cellStyle;
        return {
            name: "cellStyle",
            properties: {
                rawMap: {
                    builtinId,
                    name,
                    xfId
                }
            }
        };
    }
};
exports.default = borderFactory;
