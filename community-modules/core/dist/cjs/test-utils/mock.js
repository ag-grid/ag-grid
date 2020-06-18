/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
// TODO: ideally would use 'jest-mock-extended' but this requires TypeScript 3.7 - reintroduce after upgrade
Object.defineProperty(exports, "__esModule", { value: true });
function mock() {
    var mockedMethods = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        mockedMethods[_i] = arguments[_i];
    }
    var partiallyMocked = {};
    mockedMethods.forEach(function (mockedMethod) { return partiallyMocked[mockedMethod] = jest.fn(); });
    return partiallyMocked;
}
exports.mock = mock;

//# sourceMappingURL=mock.js.map
