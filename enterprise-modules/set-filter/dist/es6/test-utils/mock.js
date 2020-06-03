// TODO: ideally would use 'jest-mock-extended' but this requires TypeScript 3.7 - reintroduce after upgrade
export function mock() {
    var mockedMethods = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        mockedMethods[_i] = arguments[_i];
    }
    var partiallyMocked = {};
    mockedMethods.forEach(function (mockedMethod) { return partiallyMocked[mockedMethod] = jest.fn(); });
    return partiallyMocked;
}
