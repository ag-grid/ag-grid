"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colorScheme_1 = require("./colorScheme");
const fontScheme_1 = require("./fontScheme");
const formatScheme_1 = require("./formatScheme");
const themeElements = {
    getTemplate() {
        return {
            name: "a:themeElements",
            children: [
                colorScheme_1.default.getTemplate(),
                fontScheme_1.default.getTemplate(),
                formatScheme_1.default.getTemplate()
            ]
        };
    }
};
exports.default = themeElements;
