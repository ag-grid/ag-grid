let element: HTMLElement | null = null;

export function sanitizeHtml(text?: string): string {
    element = element || document.createElement('div');
    if (!text) {
        return '';
    }
    element.innerText = text;
    return element.innerHTML;
}
