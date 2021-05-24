/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dom_1 = require("./dom");
var string_1 = require("./string");
var object_1 = require("./object");
/** @deprecated */
function getNameOfClass(theClass) {
    var funcNameRegex = /function (.{1,})\(/;
    var funcAsString = theClass.toString();
    var results = funcNameRegex.exec(funcAsString);
    return results && results.length > 1 ? results[1] : "";
}
exports.getNameOfClass = getNameOfClass;
function findLineByLeastSquares(values) {
    var len = values.length;
    var maxDecimals = 0;
    if (len <= 1) {
        return values;
    }
    for (var i = 0; i < values.length; i++) {
        var value = values[i];
        if (Math.floor(value) === value) {
            continue;
        }
        maxDecimals = Math.max(maxDecimals, value.toString().split('.')[1].length);
    }
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var y = 0;
    for (var x = 0; x < len; x++) {
        y = values[x];
        sum_x += x;
        sum_y += y;
        sum_xx += x * x;
        sum_xy += x * y;
    }
    var m = (len * sum_xy - sum_x * sum_y) / (len * sum_xx - sum_x * sum_x);
    var b = (sum_y / len) - (m * sum_x) / len;
    var result = [];
    for (var x = 0; x <= len; x++) {
        result.push(parseFloat((x * m + b).toFixed(maxDecimals)));
    }
    return result;
}
exports.findLineByLeastSquares = findLineByLeastSquares;
/**
 * Converts a CSS object into string
 * @param {Object} stylesToUse an object eg: {color: 'black', top: '25px'}
 * @return {string} A string like "color: black; top: 25px;" for html
 */
function cssStyleObjectToMarkup(stylesToUse) {
    if (!stylesToUse) {
        return '';
    }
    var resParts = [];
    object_1.iterateObject(stylesToUse, function (styleKey, styleValue) {
        var styleKeyDashed = string_1.camelCaseToHyphen(styleKey);
        resParts.push(styleKeyDashed + ": " + styleValue + ";");
    });
    return resParts.join(' ');
}
exports.cssStyleObjectToMarkup = cssStyleObjectToMarkup;
/**
 * Displays a message to the browser. this is useful in iPad, where you can't easily see the console.
 * so the javascript code can use this to give feedback. this is NOT intended to be called in production.
 * it is intended the AG Grid developer calls this to troubleshoot, but then takes out the calls before
 * checking in.
 * @param {string} msg
 */
function message(msg) {
    var eMessage = document.createElement('div');
    var eBox = document.querySelector('#__ag__message');
    eMessage.innerHTML = msg;
    if (!eBox) {
        var template = "<div id=\"__ag__message\" style=\"display: inline-block; position: absolute; top: 0px; left: 0px; color: white; background-color: black; z-index: 20; padding: 2px; border: 1px solid darkred; height: 200px; overflow-y: auto;\"></div>";
        eBox = dom_1.loadTemplate(template);
        if (document.body) {
            document.body.appendChild(eBox);
        }
    }
    eBox.insertBefore(eMessage, eBox.children[0]);
}
exports.message = message;
/**
 * cell renderers are used in a few places. they bind to dom slightly differently to other cell renderes as they
 * can return back strings (instead of html elemnt) in the getGui() method. common code placed here to handle that.
 * @param {AgPromise<ICellRendererComp>} cellRendererPromise
 * @param {HTMLElement} eTarget
 */
function bindCellRendererToHtmlElement(cellRendererPromise, eTarget) {
    cellRendererPromise.then(function (cellRenderer) {
        var gui = cellRenderer.getGui();
        if (gui != null) {
            if (typeof gui === 'object') {
                eTarget.appendChild(gui);
            }
            else {
                eTarget.innerHTML = gui;
            }
        }
    });
}
exports.bindCellRendererToHtmlElement = bindCellRendererToHtmlElement;

//# sourceMappingURL=general.js.map
