"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function windowValue(name) {
    var _a;
    /**
     * Redeclaration of window that is safe for use with Gatsby server-side (webpack) compilation.
     */
    const WINDOW = typeof window !== 'undefined'
        ? window
        : // typeof global !== 'undefined' ? (global as any) :
            undefined;
    return (_a = WINDOW) === null || _a === void 0 ? void 0 : _a[name];
}
exports.windowValue = windowValue;
