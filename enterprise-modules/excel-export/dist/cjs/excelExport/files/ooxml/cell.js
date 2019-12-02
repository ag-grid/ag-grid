"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var stylesheet_1 = require("./styles/stylesheet");
var convertLegacyType = function (type) {
    var t = type.charAt(0).toLowerCase();
    return t === 's' ? 'inlineStr' : t;
};
var cellFactory = {
    getTemplate: function (config) {
        var ref = config.ref, data = config.data, styleId = config.styleId;
        var type = data.type, value = data.value;
        var convertedType = type;
        if (type.charAt(0) === type.charAt(0).toUpperCase()) {
            convertedType = convertLegacyType(type);
        }
        var obj = {
            name: 'c',
            properties: {
                rawMap: {
                    r: ref,
                    t: convertedType === 'empty' ? undefined : convertedType,
                    s: styleId ? stylesheet_1.getStyleId(styleId) : undefined
                }
            }
        };
        var children;
        if (convertedType === 'inlineStr') {
            children = [{
                    name: 'is',
                    children: [{
                            name: 't',
                            textNode: core_1._.escape(core_1._.utf8_encode(value))
                        }]
                }];
        }
        else {
            children = [{
                    name: 'v',
                    textNode: value
                }];
        }
        return core_1._.assign({}, obj, { children: children });
    }
};
exports.default = cellFactory;
//# sourceMappingURL=cell.js.map