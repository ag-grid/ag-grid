"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mergeCellFactory = {
    getTemplate: function (ref) {
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
