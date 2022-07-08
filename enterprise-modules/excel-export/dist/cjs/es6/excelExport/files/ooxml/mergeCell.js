"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mergeCellFactory = {
    getTemplate(ref) {
        return {
            name: 'mergeCell',
            properties: {
                rawMap: {
                    ref: ref
                }
            }
        };
    }
};
exports.default = mergeCellFactory;
