import {Bean} from "../context/context";

@Bean("downloader")
export class Downloader {
    download(fileName: string, content: Blob) {
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(content, fileName);
        } else {
            // Chrome
            const element = document.createElement("a");
            const url = window.URL.createObjectURL(content);
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