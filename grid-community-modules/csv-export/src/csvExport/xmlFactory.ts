import { HeaderElement, PrefixedXmlAttributes, XmlElement } from "@ag-grid-community/core";

const LINE_SEPARATOR = '\r\n';

export class XmlFactory {
    public static createHeader(headerElement: HeaderElement = {}): string {
        const headerStart = '<?';
        const headerEnd = '?>';
        const keys = ['version'];

        if (!headerElement.version) { headerElement.version = "1.0"; }
        if (headerElement.encoding) { keys.push('encoding'); }
        if (headerElement.standalone) { keys.push('standalone'); }

        const att = keys.map((key: string): string => `${key}="${headerElement[key]}"`).join(' ');
        return `${headerStart}xml ${att} ${headerEnd}`;
    }

    public static createXml(xmlElement: XmlElement, booleanTransformer?:(currentValue:boolean) => string) :string {
        let props: string = '';
        if (xmlElement.properties) {
            if (xmlElement.properties.prefixedAttributes) {
                xmlElement.properties.prefixedAttributes.forEach((prefixedSet:PrefixedXmlAttributes) => {
                    Object.keys(prefixedSet.map).forEach((key) => {
                        props += this.returnAttributeIfPopulated(prefixedSet.prefix + key, prefixedSet.map[key], booleanTransformer);
                    });
                });
            }

            if (xmlElement.properties.rawMap) {
                Object.keys(xmlElement.properties.rawMap).forEach((key) => {
                    props += this.returnAttributeIfPopulated(key, xmlElement.properties!.rawMap[key], booleanTransformer);
                });
            }
        }
        let result: string = '<' + xmlElement.name + props;

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

    private static returnAttributeIfPopulated(key: string, value: any, booleanTransformer?:(currentValue:boolean) => string) {
        if (!value && value !== '' && value !== 0) {
            return '';
        }

        let xmlValue: string = value;
        if ((typeof(value) === 'boolean')) {
            if (booleanTransformer) {
                xmlValue = booleanTransformer(value);
            }
        }

        return ` ${key}="${xmlValue}"`;
    }

}
