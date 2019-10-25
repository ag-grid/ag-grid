import { HeaderElement, XmlElement } from "@ag-community/grid-core";
export declare class XmlFactory {
    createHeader(headerElement?: HeaderElement): string;
    createXml(xmlElement: XmlElement, booleanTransformer?: (currentValue: boolean) => string): string;
    private returnAttributeIfPopulated;
}
