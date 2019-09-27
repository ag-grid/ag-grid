/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
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
var context_1 = require("../context/context");
var Downloader = /** @class */ (function () {
    function Downloader() {
    }
    Downloader.prototype.download = function (fileName, content) {
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
    Downloader = __decorate([
        context_1.Bean("downloader")
    ], Downloader);
    return Downloader;
}());
exports.Downloader = Downloader;
