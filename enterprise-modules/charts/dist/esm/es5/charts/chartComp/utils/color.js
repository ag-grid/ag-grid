import { Color } from "@ag-grid-community/core";
export function hexToRGBA(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return alpha ? "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")" : "rgba(" + r + ", " + g + ", " + b + ")";
}
export function changeOpacity(fills, alpha) {
    return fills.map(function (fill) {
        var c = Color.fromString(fill);
        return new Color(c.r, c.g, c.b, alpha).toHexString();
    });
}
