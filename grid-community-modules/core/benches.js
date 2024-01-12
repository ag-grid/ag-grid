"use strict";
exports.__esModule = true;
var attest_1 = require("@arktype/attest");
// const f: ColDef<IRowData> = {
//     field: 's'
// }
(0, attest_1.bench)('bench type', function () {
    return { field: 'b.b.b.a' };
}).types([537, 'instantiations']);
/* bench('bench type', () => {
    return {field: 'b'} as ColDef<IRowData2, unknown>;
}).types([2831, 'instantiations']); */
/* bench('bench field2', () => {
    
    return '' as NestedPath<{a: {b:Function}},'',number, []>;
}).types([3, 'instantiations']); */
/* bench('bench runtime and type', () => {
    return { field: 'a' } as ColDef<IRowData>;
}).types([112, 'instantiations']);

bench('bench runtime and Recusvie type', () => {
    return { field: 'child.a' } as ColDef<IRowData2>;
}).types([2161, 'instantiations']); */
