import { HeaderElement, XmlElement } from "./dist/lib/../interfaces/iXmlFactory";
export declare class XmlFactory {
    createHeader(headerElement?: HeaderElement): string;
    createXml(xmlElement: XmlElement, booleanTransformer?: (currentValue: boolean) => string): string;
    private returnAttributeIfPopulated;
}
