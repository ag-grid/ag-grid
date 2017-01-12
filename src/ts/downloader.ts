import {Bean} from "./context/context";

@Bean('downloader')
export class Downloader {
    download (fileName:string, content:string, mimeType:string){
        // for Excel, we need \ufeff at the start
        // http://stackoverflow.com/questions/17879198/adding-utf-8-bom-to-string-blob
        var blobObject = new Blob(["\ufeff", content], {
            type: mimeType
        });
        // Internet Explorer
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blobObject, fileName);
        } else {
            // Chrome
            var downloadLink = document.createElement("a");
            downloadLink.href = (<any>window).URL.createObjectURL(blobObject);
            (<any>downloadLink).download = fileName;

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    }
}