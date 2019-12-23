import { HeaderElement, XmlElement } from "@ag-grid-community/core";
export declare class XmlFactory {
    createHeader(headerElement?: HeaderElement): string;
    createXml(xmlElement: XmlElement, booleanTransformer?: (currentValue: boolean) => string): string;
    private returnAttributeIfPopulated;
}
