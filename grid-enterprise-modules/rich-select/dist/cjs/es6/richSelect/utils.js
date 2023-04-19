"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindCellRendererToHtmlElement = void 0;
/**
 * cell renderers are used in a few places. they bind to dom slightly differently to other cell renderes as they
 * can return back strings (instead of html elemnt) in the getGui() method. common code placed here to handle that.
 * @param {AgPromise<ICellRendererComp>} cellRendererPromise
 * @param {HTMLElement} eTarget
 */
function bindCellRendererToHtmlElement(cellRendererPromise, eTarget) {
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
exports.bindCellRendererToHtmlElement = bindCellRendererToHtmlElement;
