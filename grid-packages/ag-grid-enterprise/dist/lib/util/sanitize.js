"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeHtml = void 0;
var element = null;
function sanitizeHtml(text) {
    element = element !== null && element !== void 0 ? element : document.createElement('div');
    if (!text) {
        return '';
    }
    element.textContent = text;
    return element.innerHTML;
}
exports.sanitizeHtml = sanitizeHtml;
//# sourceMappingURL=sanitize.js.map