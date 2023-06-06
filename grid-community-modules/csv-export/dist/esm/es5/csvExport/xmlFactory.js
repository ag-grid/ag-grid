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
export { XmlFactory };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieG1sRmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jc3ZFeHBvcnQveG1sRmFjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxJQUFNLGNBQWMsR0FBRyxNQUFNLENBQUM7QUFFOUI7SUFBQTtJQWtFQSxDQUFDO0lBakVpQix1QkFBWSxHQUExQixVQUEyQixhQUFpQztRQUFqQyw4QkFBQSxFQUFBLGtCQUFpQztRQUN4RCxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDekIsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLElBQU0sSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFekIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUU7WUFBRSxhQUFhLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztTQUFFO1FBQzlELElBQUksYUFBYSxDQUFDLFFBQVEsRUFBRTtZQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7U0FBRTtRQUN0RCxJQUFJLGFBQWEsQ0FBQyxVQUFVLEVBQUU7WUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQUU7UUFFMUQsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFDLEdBQVcsSUFBYSxPQUFHLEdBQUcsV0FBSyxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQUcsRUFBaEMsQ0FBZ0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxRixPQUFVLFdBQVcsWUFBTyxHQUFHLFNBQUksU0FBVyxDQUFDO0lBQ25ELENBQUM7SUFFYSxvQkFBUyxHQUF2QixVQUF3QixVQUFzQixFQUFFLGtCQUFvRDtRQUFwRyxpQkFtQ0M7UUFsQ0csSUFBSSxLQUFLLEdBQVcsRUFBRSxDQUFDO1FBQ3ZCLElBQUksVUFBVSxDQUFDLFVBQVUsRUFBRTtZQUN2QixJQUFJLFVBQVUsQ0FBQyxV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