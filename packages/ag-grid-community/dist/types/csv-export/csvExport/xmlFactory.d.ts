import type { HeaderElement, XmlElement } from 'ag-grid-community';
export declare class XmlFactory {
    static createHeader(headerElement?: HeaderElement): string;
    static createXml(xmlElement: XmlElement, booleanTransformer?: (currentValue: boolean) => string): string;
}
