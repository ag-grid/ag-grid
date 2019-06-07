// ag-grid-enterprise v21.0.1
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var array_1 = require("./array");
test('extent', function () {
    {
        var result = array_1.extent([3, 7, 1, 2, 9, -2]);
        expect(result[0]).toBe(-2);
        expect(result[1]).toBe(9);
    }
    {
        var result = array_1.extent([NaN, null, undefined]);
        expect(result[0]).toBe(undefined);
        expect(result[1]).toBe(undefined);
    }
    {
        var result = array_1.extent([new Date(), new Date('03/03/1970'), new Date('05/05/1985')]);
        expect(result[0].getFullYear()).toBe(1970);
        expect(result[1].getFullYear()).toBe(2019);
    }
    {
        var result = array_1.extent(['X', 'A', 'Y', 'Z', 'C', 'B']);
        expect(result[0]).toBe('A');
        expect(result[1]).toBe('Z');
    }
});
