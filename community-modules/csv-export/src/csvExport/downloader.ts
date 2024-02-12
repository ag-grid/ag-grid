export class Downloader {
    public static download(fileName: string, content: Blob) {
        const win = document.defaultView || window;

        if (!win) {
            console.warn('AG Grid: There is no `window` associated with the current `document`');
            return;
        }

        const element = document.createElement('a');
        // @ts-ignore
        const url = win.URL.createObjectURL(content);
        element.setAttribute('href', url);
        element.setAttribute('download', fileName);
        element.style.display = 'none';
        document.body.appendChild(element);

        element.dispatchEvent(new MouseEvent('click', {
            bubbles: false,
            cancelable: true,
            view: win
        }));

        document.body.removeChild(element);

        win.setTimeout(() => {
            // @ts-ignore
            win.URL.revokeObjectURL(url);
        }, 0);
    }
}
