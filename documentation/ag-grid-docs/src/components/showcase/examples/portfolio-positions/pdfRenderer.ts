export function renderPdfLink() {
    const pdfUrl = 'https://pdfobject.com/pdf/sample.pdf';
    const linkText = 'Trade Advice';

    const linkElement = document.createElement('a');
    linkElement.href = pdfUrl;
    linkElement.textContent = linkText;

    return linkElement.outerHTML;
}
