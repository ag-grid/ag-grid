export function renderPdfLink() {
    var pdfUrl = 'https://pdfobject.com/pdf/sample.pdf';
    var linkText = 'Trade Advice';

    var linkElement = document.createElement('a');
    linkElement.href = pdfUrl;
    linkElement.textContent = linkText;

    return linkElement.outerHTML;
}
