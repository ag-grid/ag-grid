import { _ } from '@ag-grid-community/core';
var buildSharedString = function (textNode) {
    textNode = textNode.toString();
    var child = {
        name: 't',
        textNode: _.utf8_encode(_.escapeString(textNode))
    };
    // if we have leading or trailing spaces, instruct Excel not to trim them
    var preserveSpaces = textNode.replace(/^\s*|\s*$/g, '').length !== textNode.length;
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
var sharedStrings = {
    getTemplate: function (strings) {
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
