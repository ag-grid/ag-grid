"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var md5_1 = require("./md5");
describe("MD5", function () {
    test("should return valid MD5 hash", function () {
        var result = new md5_1.MD5().md5("test value");
        expect(result).toBe("cc2d2adc8b1da820c1075a099866ceb4");
    });
});
//# sourceMappingURL=md5.test.js.map