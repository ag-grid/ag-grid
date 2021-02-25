import { ExcelOOXMLTemplate, XmlElement, _ } from '@ag-grid-community/core';

const buildSharedString = (textNode: string): XmlElement => {
    textNode = textNode.toString();

    const child: XmlElement = {
        name: 't',
        textNode: _.utf8_encode(_.escapeString(textNode))
    };
    // if we have leading or trailing spaces, instruct Excel not to trim them
    const preserveSpaces = textNode.replace(/^\s*|\s*$/g, '').length !== textNode.length;

    if (preserveSpaces) {
        child.properties = {
            rawMap: {
                "xml:space": "preserve"
            }
        };
    }

    return {
        name: 'si',
        children: [child]
    };
};

const sharedStrings: ExcelOOXMLTemplate = {
    getTemplate(strings: string[]) {
        return {
            name: "sst",
            properties: {
                rawMap: {
                    xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
                    count: strings.length,
                    uniqueCount: strings.length
                }
            },
            children: strings.map(buildSharedString)
        };
    }
};

export default sharedStrings;
