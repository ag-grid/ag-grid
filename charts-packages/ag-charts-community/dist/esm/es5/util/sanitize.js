var element = null;
export function sanitizeHtml(text) {
    element = element || document.createElement('div');
    if (!text) {
        return '';
    }
    element.innerText = text;
    return element.innerHTML;
}
