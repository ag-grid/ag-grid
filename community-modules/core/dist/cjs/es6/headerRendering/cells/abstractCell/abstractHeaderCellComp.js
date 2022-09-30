/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const component_1 = require("../../../widgets/component");
class AbstractHeaderCellComp extends component_1.Component {
    constructor(template, ctrl) {
        super(template);
        this.ctrl = ctrl;
    }
    getCtrl() {
        return this.ctrl;
    }
}
exports.AbstractHeaderCellComp = AbstractHeaderCellComp;
