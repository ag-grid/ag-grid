// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var borderFactory = {
    getTemplate: function (cellStyle) {
        var builtinId = cellStyle.builtinId, name = cellStyle.name, xfId = cellStyle.xfId;
        return {
            name: "cellStyle",
            properties: {
                rawMap: {
                    builtinId: builtinId,
                    name: name,
                    xfId: xfId
                }
            }
        };
    }
};
exports.default = borderFactory;
