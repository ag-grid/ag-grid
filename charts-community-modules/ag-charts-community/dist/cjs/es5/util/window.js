"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.windowValue = void 0;
function windowValue(name) {
    /**
     * Redeclaration of window that is safe for use with Gatsby server-side (webpack) compilation.
     */
    var WINDOW = typeof window !== 'undefined'
        ? window
        : // typeof global !== 'undefined' ? (global as any) :
            undefined;
    return WINDOW === null || WINDOW === void 0 ? void 0 : WINDOW[name];
}
exports.windowValue = windowValue;
