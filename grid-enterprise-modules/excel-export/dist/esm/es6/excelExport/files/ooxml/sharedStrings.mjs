import { _ } from '@ag-grid-community/core';
const buildSharedString = (strMap) => {
    const ret = [];
    strMap.forEach((val, key) => {
        const textNode = key.toString();
        const child = {
            name: 't',
            textNode: _.utf8_encode(_.escapeString(textNode))
        };
        // if we have leading or trailing spaces, instruct Excel not to trim them
        const preserveSpaces = textNode.trim().length !== textNode.length;
        if (preserveSpaces) {
            child.properties = {
                rawMap: {
                    "xml:space": "preserve"
                }
            };
        }
        ret.push({
            name: 'si',
            children: [child]
        });
    });
    return ret;
};
const sharedStrings = {
    getTemplate(strings) {
        return {
            name: "sst",
            properties: {
                rawMap: {
                    xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
                    count: strings.size,
                    uniqueCount: strings.size
                }
            },
            children: buildSharedString(strings)
        };
    }
};
export default sharedStrings;
