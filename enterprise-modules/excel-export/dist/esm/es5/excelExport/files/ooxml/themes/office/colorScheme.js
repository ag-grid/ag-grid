var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var getColorChildren = function (props) {
    var _a = __read(props, 4), type = _a[0], innerType = _a[1], val = _a[2], lastClr = _a[3];
    return {
        name: "a:" + type,
        children: [{
                name: "a:" + innerType,
                properties: {
                    rawMap: {
                        val: val,
                        lastClr: lastClr
                    }
                }
            }]
    };
};
var colorScheme = {
    getTemplate: function () {
        return {
            name: "a:clrScheme",
            properties: {
                rawMap: {
                    name: "Office"
                }
            },
            children: [
                getColorChildren(['dk1', 'sysClr', 'windowText', '000000']),
                getColorChildren(['lt1', 'sysClr', 'window', 'FFFFFF']),
                getColorChildren(['dk2', 'srgbClr', '44546A']),
                getColorChildren(['lt2', 'srgbClr', 'E7E6E6']),
                getColorChildren(['accent1', 'srgbClr', '4472C4']),
                getColorChildren(['accent2', 'srgbClr', 'ED7D31']),
                getColorChildren(['accent3', 'srgbClr', 'A5A5A5']),
                getColorChildren(['accent4', 'srgbClr', 'FFC000']),
                getColorChildren(['accent5', 'srgbClr', '5B9BD5']),
                getColorChildren(['accent6', 'srgbClr', '70AD47']),
                getColorChildren(['hlink', 'srgbClr', '0563C1']),
                getColorChildren(['folHlink', 'srgbClr', '954F72'])
            ]
        };
    }
};
export default colorScheme;
