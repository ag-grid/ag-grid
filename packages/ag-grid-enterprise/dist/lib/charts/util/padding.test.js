// ag-grid-enterprise v21.0.1
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var padding_1 = require("./padding");
test('constructor', function () {
    {
        var padding = new padding_1.Padding();
        expect(padding.top).toBe(0);
        expect(padding.right).toBe(0);
        expect(padding.bottom).toBe(0);
        expect(padding.left).toBe(0);
    }
    {
        var padding = new padding_1.Padding(10);
        expect(padding.top).toBe(10);
        expect(padding.right).toBe(10);
        expect(padding.bottom).toBe(10);
        expect(padding.left).toBe(10);
    }
    {
        var padding = new padding_1.Padding(10, 20);
        expect(padding.top).toBe(10);
        expect(padding.right).toBe(20);
        expect(padding.bottom).toBe(10);
        expect(padding.left).toBe(20);
    }
    {
        var padding = new padding_1.Padding(10, 20, 30);
        expect(padding.top).toBe(10);
        expect(padding.right).toBe(20);
        expect(padding.bottom).toBe(30);
        expect(padding.left).toBe(20);
    }
    {
        var padding = new padding_1.Padding(10, 20, 30, 40);
        expect(padding.top).toBe(10);
        expect(padding.right).toBe(20);
        expect(padding.bottom).toBe(30);
        expect(padding.left).toBe(40);
    }
});
