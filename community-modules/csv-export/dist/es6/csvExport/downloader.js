var Downloader = /** @class */ (function () {
    function Downloader() {
    }
    Downloader.download = function (fileName, content) {
        var win = document.defaultView || window;
        if (!win) {
            console.warn('AG Grid: There is no `window` associated with the current `document`');
            return;
        }
        // Internet Explorer
        if (win.navigator.msSaveOrOpenBlob) {
            win.navigator.msSaveOrOpenBlob(content, fileName);
        }
        else {
            // Other Browsers
            var element = document.createElement('a');
            // @ts-ignore
            var url_1 = win.URL.createObjectURL(content);
            element.setAttribute('href', url_1);
            element.setAttribute('download', fileName);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.dispatchEvent(new MouseEvent('click', {
                bubbles: false,
                cancelable: true,
                view: win
            }));
            document.body.removeChild(element);
            win.setTimeout(function () {
                // @ts-ignore
                win.URL.revokeObjectURL(url_1);
            }, 0);
        }
    };
    return Downloader;
}());
export { Downloader };
