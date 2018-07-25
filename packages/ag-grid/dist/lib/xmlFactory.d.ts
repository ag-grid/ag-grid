// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare class XmlFactory {
    createXml(xmlElement: XmlElement, booleanTransformer?: (currentValue: boolean) => string): string;
    private returnAttributeIfPopulated(key, value, booleanTransformer?);
}
export interface XmlElement {
    name: string;
    properties?: XmlAttributes;
    children?: XmlElement[];
    textNode?: string;
}
export interface XmlAttributes {
    prefixedAttributes?: PrefixedXmlAttributes[];
    rawMap?: any;
}
export interface PrefixedXmlAttributes {
    prefix: string;
    map: any;
}
