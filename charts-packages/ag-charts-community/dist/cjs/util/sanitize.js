"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var element = document.createElement('div');
function sanitizeHtml(text) {
    if (!text) {
        return '';
    }
    element.innerText = text;
    return element.innerHTML;
}
exports.sanitizeHtml = sanitizeHtml;
//# sourceMappingURL=sanitize.js.map