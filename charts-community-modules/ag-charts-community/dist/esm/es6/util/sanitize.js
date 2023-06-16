let element = null;
export function sanitizeHtml(text) {
    element = element !== null && element !== void 0 ? element : document.createElement('div');
    if (!text) {
        return '';
    }
    element.textContent = text;
    return element.innerHTML;
}
