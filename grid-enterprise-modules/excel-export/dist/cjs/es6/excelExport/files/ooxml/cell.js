"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const stylesheet_1 = require("./styles/stylesheet");
const convertLegacyType = (type) => {
    const t = type.charAt(0).toLowerCase();
    return t === 's' ? 'inlineStr' : t;
};
const cellFactory = {
    getTemplate(config, idx, currentSheet) {
        const { ref, data, styleId } = config;
        const { type, value } = data || { type: 'empty', value: null };
        let convertedType = type;
        if (type === 'f') {
            convertedType = 'str';
        }
        else if (type.charAt(0) === type.charAt(0).toUpperCase()) {
            convertedType = convertLegacyType(type);
        }
        const obj = {
            name: 'c',
            properties: {
                rawMap: {
                    r: ref,
                    t: convertedType === 'empty' ? undefined : convertedType,
                    s: styleId ? stylesheet_1.getStyleId(styleId, currentSheet) : undefined
                }
            }
        };
        if (convertedType === 'empty') {
            return obj;
        }
        let children;
        if (convertedType === 'str' && type === 'f') {
            children = [{
                    name: 'f',
                    textNode: core_1._.escapeString(core_1._.utf8_encode(value))
                }];
        }
        else if (convertedType === 'inlineStr') {
            children = [{
                    name: 'is',
                    children: [{
                            name: 't',
                            textNode: core_1._.escapeString(core_1._.utf8_encode(value))
                        }]
                }];
        }
        else {
            children = [{
                    name: 'v',
                    textNode: value
                }];
        }
        return Object.assign({}, obj, { children });
    }
};
exports.default = cellFactory;
