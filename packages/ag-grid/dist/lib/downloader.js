/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v18.1.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("./context/context");
var Downloader = (function () {
    function Downloader() {
    }
    Downloader.prototype.download = function (fileName, content, mimeType) {
        // for Excel, we need \ufeff at the start
        // http://stackoverflow.com/questions/17879198/adding-utf-8-bom-to-string-blob
        // Internet Explorer
        if (window.navigator.msSaveOrOpenBlob) {
            var blobObject = new Blob(["\ufeff", content], {
                type: mimeType
            });
            window.navigator.msSaveOrOpenBlob(blobObject, fileName);
        }
        else {
            // Chrome
            var element = document.createElement("a");
            var blob = new Blob(["\ufeff", content], { type: "octet/stream" });
            var url = window.URL.createObjectURL(blob);
            element.setAttribute("href", url);
            element.setAttribute("download", fileName);
            element.style.display = "none";
            document.body.appendChild(element);
            element.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(element);
        }
    };
    Downloader = __decorate([
        context_1.Bean("downloader")
    ], Downloader);
    return Downloader;
}());
exports.Downloader = Downloader;
