"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alignment_1 = require("./alignment");
const protection_1 = require("./protection");
const xfFactory = {
    getTemplate(xf) {
        const { alignment, borderId, fillId, fontId, numFmtId, protection, xfId } = xf;
        const children = [];
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
                    applyFill: fillId ? 1 : undefined,
                    borderId,
                    fillId,
                    applyFont: fontId ? 1 : undefined,
                    fontId,
                    applyNumberFormat: numFmtId ? 1 : undefined,
                    numFmtId,
                    xfId
                }
            },
            children: children.length ? children : undefined
        };
    }
};
exports.default = xfFactory;
