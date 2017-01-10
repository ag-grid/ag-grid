import {Bean} from "./context/context";
var LINE_SEPARATOR = '\r\n';

@Bean('xmlFactory')
export class XmlFactory {
    createXml(xmlElement: XmlElement) :string{
        var props: string = "";
        if (xmlElement.properties && xmlElement.properties.prefix && xmlElement.properties.prefixedMap) {
            Object.keys(xmlElement.properties.prefixedMap).forEach((key) => {
                props += " " + xmlElement.properties.prefix + key + "=\"" + xmlElement.properties.prefixedMap[key] + "\""
            })
        }
        if (xmlElement.properties && xmlElement.properties.rawMap) {
            Object.keys(xmlElement.properties.rawMap).forEach((key) => {
                props += " " + key + "=\"" + xmlElement.properties.rawMap[key] + "\""
            })
        }
        var result: string = "<" + xmlElement.name + props;

        if (!xmlElement.children && !xmlElement.textNode) {
            return result + "/>" + LINE_SEPARATOR
        }

        if (xmlElement.textNode){
            return result + ">" + xmlElement.textNode + "</" + xmlElement.name + ">" + LINE_SEPARATOR
        }

        result += ">" + LINE_SEPARATOR;
        xmlElement.children.forEach((it) => {
            result += this.createXml(it);
        });
        return result + "</" + xmlElement.name + ">" + LINE_SEPARATOR;
    }
}


export interface XmlElement {
    name: string
    properties?: XmlAttributes
    children?: XmlElement[]
    textNode?:string
}

export interface XmlAttributes {
    prefix?: string
    prefixedMap?: any
    rawMap?: any
}