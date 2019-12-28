import { _ } from '@ag-grid-community/core';
var buildSharedString = function (textNode) { return ({
    name: 'si',
    children: [{
            name: 't',
            textNode: _.utf8_encode(_.escape(textNode.toString()))
        }]
}); };
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
