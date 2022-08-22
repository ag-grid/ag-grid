/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { loadTemplate } from './dom';
import { camelCaseToHyphen } from './string';
import { iterateObject } from './object';
/** @deprecated */
export function getNameOfClass(theClass) {
    const funcNameRegex = /function (.{1,})\(/;
    const funcAsString = theClass.toString();
    const results = funcNameRegex.exec(funcAsString);
    return results && results.length > 1 ? results[1] : "";
}
export function findLineByLeastSquares(values) {
    const len = values.length;
    let maxDecimals = 0;
    if (len <= 1) {
        return values;
    }
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        const splitExponent = value.toString().split('e-');
        if (splitExponent.length > 1) {
            maxDecimals = Math.max(maxDecimals, parseInt(splitExponent[1], 10));
            continue;
        }
        if (Math.floor(value) === value) {
            continue;
        }
        maxDecimals = Math.max(maxDecimals, value.toString().split('.')[1].length);
    }
    let sum_x = 0;
    let sum_y = 0;
    let sum_xy = 0;
    let sum_xx = 0;
    let y = 0;
    for (let x = 0; x < len; x++) {
        y = values[x];
        sum_x += x;
        sum_y += y;
        sum_xx += x * x;
        sum_xy += x * y;
    }
    const m = (len * sum_xy - sum_x * sum_y) / (len * sum_xx - sum_x * sum_x);
    const b = (sum_y / len) - (m * sum_x) / len;
    const result = [];
    for (let x = 0; x <= len; x++) {
        result.push(parseFloat((x * m + b).toFixed(maxDecimals)));
    }
    return result;
}
/**
 * Converts a CSS object into string
 * @param {Object} stylesToUse an object eg: {color: 'black', top: '25px'}
 * @return {string} A string like "color: black; top: 25px;" for html
 */
export function cssStyleObjectToMarkup(stylesToUse) {
    if (!stylesToUse) {
        return '';
    }
    const resParts = [];
    iterateObject(stylesToUse, (styleKey, styleValue) => {
        const styleKeyDashed = camelCaseToHyphen(styleKey);
        resParts.push(`${styleKeyDashed}: ${styleValue};`);
    });
    return resParts.join(' ');
}
/**
 * Displays a message to the browser. this is useful in iPad, where you can't easily see the console.
 * so the javascript code can use this to give feedback. this is NOT intended to be called in production.
 * it is intended the AG Grid developer calls this to troubleshoot, but then takes out the calls before
 * checking in.
 * @param {string} msg
 */
export function message(msg) {
    const eMessage = document.createElement('div');
    let eBox = document.querySelector('#__ag__message');
    eMessage.innerHTML = msg;
    if (!eBox) {
        const template = `<div id="__ag__message" style="display: inline-block; position: absolute; top: 0px; left: 0px; color: white; background-color: black; z-index: 20; padding: 2px; border: 1px solid darkred; height: 200px; overflow-y: auto;"></div>`;
        eBox = loadTemplate(template);
        if (document.body) {
            document.body.appendChild(eBox);
        }
    }
    eBox.insertBefore(eMessage, eBox.children[0]);
}
/**
 * cell renderers are used in a few places. they bind to dom slightly differently to other cell renderes as they
 * can return back strings (instead of html elemnt) in the getGui() method. common code placed here to handle that.
 * @param {AgPromise<ICellRendererComp>} cellRendererPromise
 * @param {HTMLElement} eTarget
 */
export function bindCellRendererToHtmlElement(cellRendererPromise, eTarget) {
    cellRendererPromise.then(cellRenderer => {
        const gui = cellRenderer.getGui();
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
