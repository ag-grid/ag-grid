const LINE_SEPARATOR = '\r\n';
export class XmlFactory {
    static createHeader(headerElement = {}) {
        const headerStart = '<?';
        const headerEnd = '?>';
        const keys = ['version'];
        if (!headerElement.version) {
            headerElement.version = "1.0";
        }
        if (headerElement.encoding) {
            keys.push('encoding');
        }
        if (headerElement.standalone) {
            keys.push('standalone');
        }
        const att = keys.map((key) => `${key}="${headerElement[key]}"`).join(' ');
        return `${headerStart}xml ${att} ${headerEnd}`;
    }
    static createXml(xmlElement, booleanTransformer) {
        let props = '';
        if (xmlElement.properties) {
            if (xmlElement.properties.prefixedAttributes) {
                xmlElement.properties.prefixedAttributes.forEach((prefixedSet) => {
                    Object.keys(prefixedSet.map).forEach((key) => {
                        props += this.returnAttributeIfPopulated(prefixedSet.prefix + key, prefixedSet.map[key], booleanTransformer);
                    });
                });
            }
            if (xmlElement.properties.rawMap) {
                Object.keys(xmlElement.properties.rawMap).forEach((key) => {
                    props += this.returnAttributeIfPopulated(key, xmlElement.properties.rawMap[key], booleanTransformer);
                });
            }
        }
        let result = '<' + xmlElement.name + props;
        if (!xmlElement.children && xmlElement.textNode == null) {
            return result + '/>' + LINE_SEPARATOR;
        }
        if (xmlElement.textNode != null) {
            return result + '>' + xmlElement.textNode + '</' + xmlElement.name + '>' + LINE_SEPARATOR;
        }
        result += '>' + LINE_SEPARATOR;
        if (xmlElement.children) {
            xmlElement.children.forEach((it) => {
                result += this.createXml(it, booleanTransformer);
            });
        }
        return result + '</' + xmlElement.name + '>' + LINE_SEPARATOR;
    }
    static returnAttributeIfPopulated(key, value, booleanTransformer) {
        if (!value && value !== '' && value !== 0) {
            return '';
        }
        let xmlValue = value;
        if ((typeof (value) === 'boolean')) {
            if (booleanTransformer) {
                xmlValue = booleanTransformer(value);
            }
        }
        return ` ${key}="${xmlValue}"`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieG1sRmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jc3ZFeHBvcnQveG1sRmFjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUM7QUFFOUIsTUFBTSxPQUFPLFVBQVU7SUFDWixNQUFNLENBQUMsWUFBWSxDQUFDLGdCQUErQixFQUFFO1FBQ3hELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQztRQUN6QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDdkIsTUFBTSxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUV6QixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRTtZQUFFLGFBQWEsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1NBQUU7UUFDOUQsSUFBSSxhQUFhLENBQUMsUUFBUSxFQUFFO1lBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUFFO1FBQ3RELElBQUksYUFBYSxDQUFDLFVBQVUsRUFBRTtZQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7U0FBRTtRQUUxRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBVyxFQUFVLEVBQUUsQ0FBQyxHQUFHLEdBQUcsS0FBSyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxRixPQUFPLEdBQUcsV0FBVyxPQUFPLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQztJQUNuRCxDQUFDO0lBRU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFzQixFQUFFLGtCQUFvRDtRQUNoRyxJQUFJLEtBQUssR0FBVyxFQUFFLENBQUM7UUFDdkIsSUFBSSxVQUFVLENBQUMsVUFBVSxFQUFFO1lBQ3ZCLElBQUksVUFBVSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRTtn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