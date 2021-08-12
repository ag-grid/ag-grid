var element = document.createElement('div');
export function sanitizeHtml(text) {
    if (!text) {
        return '';
    }
    element.innerText = text;
    return element.innerHTML;
}
