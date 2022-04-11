"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LINE_SEPARATOR = '\r\n';
var XmlFactory = /** @class */ (function () {
    function XmlFactory() {
    }
    XmlFactory.createHeader = function (headerElement) {
        if (headerElement === void 0) { headerElement = {}; }
        var headerStart = '<?';
        var headerEnd = '?>';
        var keys = ['version'];
        if (!headerElement.version) {
            headerElement.version = "1.0";
        }
        if (headerElement.encoding) {
            keys.push('encoding');
        }
        if (headerElement.standalone) {
            keys.push('standalone');
        }
        var att = keys.map(function (key) { return key + "=\"" + headerElement[key] + "\""; }).join(' ');
        return headerStart + "xml " + att + " " + headerEnd;
    };
    XmlFactory.createXml = function (xmlElement, booleanTransformer) {
        var _this = this;
        var props = '';
        if (xmlElement.properties) {
            if (xmlElement.properties.prefixedAttributes) {
                xmlElement.properties.prefixedAttributes.forEach(function (prefixedSet) {
                    Object.keys(prefixedSet.map).forEach(function (key) {
                        props += _this.returnAttributeIfPopulated(prefixedSet.prefix + key, prefixedSet.map[key], booleanTransformer);
                    });
                });
            }
            if (xmlElement.properties.rawMap) {
                Object.keys(xmlElement.properties.rawMap).forEach(function (key) {
                    props += _this.returnAttributeIfPopulated(key, xmlElement.properties.rawMap[key], booleanTransformer);
                });
            }
        }
        var result = '<' + xmlElement.name + props;
        if (!xmlElement.children && xmlElement.textNode == null) {
            return result + '/>' + LINE_SEPARATOR;
        }
        if (xmlElement.textNode != null) {
            return result + '>' + xmlElement.textNode + '</' + xmlElement.name + '>' + LINE_SEPARATOR;
        }
        result += '>' + LINE_SEPARATOR;
        if (xmlElement.children) {
            xmlElement.children.forEach(function (it) {
                result += _this.createXml(it, booleanTransformer);
            });
        }
        return result + '</' + xmlElement.name + '>' + LINE_SEPARATOR;
    };
    XmlFactory.returnAttributeIfPopulated = function (key, value, booleanTransformer) {
        if (!value && value !== '' && value !== 0) {
            return '';
        }
        var xmlValue = value;
        if ((typeof (value) === 'boolean')) {
            if (booleanTransformer) {
                xmlValue = booleanTransformer(value);
            }
        }
        return " " + key + "=\"" + xmlValue + "\"";
    };
    return XmlFactory;
}());
exports.XmlFactory = XmlFactory;
//# sourceMappingURL=xmlFactory.js.map