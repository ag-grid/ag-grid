import { _warnOnce } from '@ag-grid-community/core';

export class Downloader {
    public static download(fileName: string, content: Blob) {
        const win = document.defaultView || window;

        if (!win) {
            _warnOnce('There is no `window` associated with the current `document`');
            return;
        }

        const element = document.createElement('a');
        const url = win.URL.createObjectURL(content);
        element.setAttribute('href', url);
        element.setAttribute('download', fileName);
        element.style.display = 'none';
        document.body.appendChild(element);

        element.dispatchEvent(
            new MouseEvent('click', {
                bubbles: false,
                cancelable: true,
                view: win,
            })
        );

        document.body.removeChild(element);

        win.setTimeout(() => {
            win.URL.revokeObjectURL(url);
        }, 0);
    }
}
