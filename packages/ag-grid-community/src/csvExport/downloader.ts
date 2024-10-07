import { _logWarn } from '../validation/logging';

export class Downloader {
    public static download(fileName: string, content: Blob) {
        const win = document.defaultView || window;

        if (!win) {
            _logWarn(52, {});
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
