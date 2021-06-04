const element = document.createElement('div');

export function sanitizeHtml(text: string): string {
    element.innerText = text;
    return element.innerHTML;
}