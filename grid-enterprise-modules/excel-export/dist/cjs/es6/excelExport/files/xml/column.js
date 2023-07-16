"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const column = {
    getTemplate(c) {
        const { width } = c;
        return {
            name: "Column",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Width: width
                        }
                    }]
            }
        };
    }
};
exports.default = column;
