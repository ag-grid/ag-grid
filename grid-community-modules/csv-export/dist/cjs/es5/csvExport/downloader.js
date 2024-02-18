"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Downloader = void 0;
var Downloader = /** @class */ (function () {
    function Downloader() {
    }
    Downloader.download = function (fileName, content) {
        var win = document.defaultView || window;
        if (!win) {
            console.warn('AG Grid: There is no `window` associated with the current `document`');
            return;
        }
        var element = document.createElement('a');
        // @ts-ignore
        var url = win.URL.createObjectURL(content);
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
        win.setTimeout(function () {
            // @ts-ignore
            win.URL.revokeObjectURL(url);
        }, 0);
    };
    return Downloader;
}());
exports.Downloader = Downloader;
