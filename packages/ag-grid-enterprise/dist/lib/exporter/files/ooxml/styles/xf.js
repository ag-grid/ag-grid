// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var alignment_1 = require("./alignment");
var protection_1 = require("./protection");
var xfFactory = {
    getTemplate: function (xf) {
        var alignment = xf.alignment, borderId = xf.borderId, fillId = xf.fillId, fontId = xf.fontId, numFmtId = xf.numFmtId, protection = xf.protection, xfId = xf.xfId;
        var children = [];
        if (alignment) {
            children.push(alignment_1.default.getTemplate(alignment));
        }
        if (protection) {
            children.push(protection_1.default.getTemplate(protection));
        }
        return {
            name: "xf",
            properties: {
                rawMap: {
                    applyAlignment: alignment ? 1 : undefined,
                    applyProtection: protection ? 1 : undefined,
                    applyBorder: borderId ? 1 : undefined,
                    borderId: borderId,
                    fillId: fillId,
                    applyFont: fontId ? 1 : undefined,
                    fontId: fontId,
                    applyNumberFormat: numFmtId ? 1 : undefined,
                    numFmtId: numFmtId,
                    xfId: xfId
                }
            },
            children: children.length ? children : undefined
        };
    }
};
exports.default = xfFactory;
