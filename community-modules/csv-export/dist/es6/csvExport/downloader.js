var Downloader = /** @class */ (function () {
    function Downloader() {
    }
    Downloader.download = function (fileName, content) {
        // Internet Explorer
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(content, fileName);
        }
        else {
            // Other Browsers
            var element = document.createElement("a");
            var url_1 = window.URL.createObjectURL(content);
            element.setAttribute("href", url_1);
            element.setAttribute("download", fileName);
            element.style.display = "none";
            document.body.appendChild(element);
            element.dispatchEvent(new MouseEvent('click', {
                bubbles: false,
                cancelable: true,
                view: window
            }));
            document.body.removeChild(element);
            window.setTimeout(function () {
                window.URL.revokeObjectURL(url_1);
            }, 0);
        }
    };
    return Downloader;
}());
export { Downloader };
