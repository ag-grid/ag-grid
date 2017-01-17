// Type definitions for ag-grid v7.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
export declare class XmlFactory {
    createXml(xmlElement: XmlElement): string;
}
export interface XmlElement {
    name: string;
    properties?: XmlAttributes;
    children?: XmlElement[];
    textNode?: string;
}
export interface XmlAttributes {
    prefix?: string;
    prefixedMap?: any;
    rawMap?: any;
}
