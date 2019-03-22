// ag-grid-enterprise v20.2.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rect_1 = require("./shape/rect");
test('isNode', function () {
    var rect = new rect_1.Rect();
    expect(rect_1.Rect.isNode(rect)).toBe(true);
    expect(rect_1.Rect.isNode({})).toBe(false);
    expect(rect_1.Rect.isNode(5)).toBe(false);
    expect(rect_1.Rect.isNode(null)).toBe(false);
    expect(rect_1.Rect.isNode(undefined)).toBe(false);
});
