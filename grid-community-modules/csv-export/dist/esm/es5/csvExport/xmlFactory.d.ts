import { HeaderElement, XmlElement } from "@ag-grid-community/core";
export declare class XmlFactory {
    static createHeader(headerElement?: HeaderElement): string;
    static createXml(xmlElement: XmlElement, booleanTransformer?: (currentValue: boolean) => string): string;
    private static returnAttributeIfPopulated;
}
