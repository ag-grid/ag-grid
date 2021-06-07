const element = document.createElement('div');

export function sanitizeHtml(text?: string): string {
    if (!text) {
        return '';
    }
    element.innerText = text;
    return element.innerHTML;
}