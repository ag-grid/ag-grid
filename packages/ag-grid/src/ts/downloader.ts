import {Bean} from "./context/context";

@Bean("downloader")
export class Downloader {
    download(fileName:string, content:string, mimeType:string) {
        // for Excel, we need \ufeff at the start
        // http://stackoverflow.com/questions/17879198/adding-utf-8-bom-to-string-blob

        // Internet Explorer
        if (window.navigator.msSaveOrOpenBlob) {
            let blobObject = new Blob(["\ufeff", content], {
                type: mimeType
            });
            window.navigator.msSaveOrOpenBlob(blobObject, fileName);
        } else {
            // Chrome
            const element = document.createElement("a");
            const blob = new Blob(["\ufeff", content], {type: "octet/stream"});
            const url = window.URL.createObjectURL(blob);
            element.setAttribute("href", url);
            element.setAttribute("download", fileName);
            element.style.display = "none";
            document.body.appendChild(element);
            element.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(element);
        }
    }
}