var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
import { _ } from '@ag-grid-community/core';
var buildSharedString = function (strMap) {
    var e_1, _a;
    var ret = [];
    try {
        for (var _b = __values(strMap.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
            var key = _c.value;
            var textNode = key.toString();
            var child = {
                name: 't',
                textNode: _.escapeString(textNode)
            };
            // if we have leading or trailing spaces, instruct Excel not to trim them
            var preserveSpaces = textNode.trim().length !== textNode.length;
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
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return ret;
};
var sharedStrings = {
    getTemplate: function (strings) {
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
