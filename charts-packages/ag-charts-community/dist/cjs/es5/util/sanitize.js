"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var element = null;
function sanitizeHtml(text) {
    element = element || document.createElement('div');
    if (!text) {
        return '';
    }
    element.textContent = text;
    return element.innerHTML;
}
exports.sanitizeHtml = sanitizeHtml;
