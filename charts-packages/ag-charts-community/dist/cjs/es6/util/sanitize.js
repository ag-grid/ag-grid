"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let element = null;
function sanitizeHtml(text) {
    element = element || document.createElement('div');
    if (!text) {
        return '';
    }
    element.innerText = text;
    return element.innerHTML;
}
exports.sanitizeHtml = sanitizeHtml;
