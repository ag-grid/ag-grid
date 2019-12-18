import { _ } from '@ag-grid-community/core';
import { getStyleId } from './styles/stylesheet';
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
                    s: styleId ? getStyleId(styleId) : undefined
                }
            }
        };
        var children;
        if (convertedType === 'inlineStr') {
            children = [{
                    name: 'is',
                    children: [{
                            name: 't',
                            textNode: _.escape(_.utf8_encode(value))
                        }]
                }];
        }
        else {
            children = [{
                    name: 'v',
                    textNode: value
                }];
        }
        return _.assign({}, obj, { children: children });
    }
};
export default cellFactory;
