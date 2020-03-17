"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(a, b) {
    var date = new Date;
    var msA = +a;
    var msB = +b - msA;
    return function (t) {
        date.setTime(msA + msB * t);
        return date;
    };
}
exports.default = default_1;
//# sourceMappingURL=date.js.map