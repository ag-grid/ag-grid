import { Bean } from "../context/context";

@Bean("downloader")
export class Downloader {
    download(fileName: string, content: Blob) {
        // Internet Explorer
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(content, fileName);
        } else {
            // Other Browsers
            const element = document.createElement("a");
            const url = window.URL.createObjectURL(content);
            element.setAttribute("href", url);
            element.setAttribute("download", fileName);
            element.style.display = "none";
            document.body.appendChild(element);

            element.dispatchEvent(new MouseEvent('click', {
                bubbles: false,
                cancelable: true,
                view: window
            }));

            document.body.removeChild(element);

            window.setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }
}
