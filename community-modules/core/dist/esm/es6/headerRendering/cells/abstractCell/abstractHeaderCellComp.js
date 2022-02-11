/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v27.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
import { Component } from "../../../widgets/component";
export class AbstractHeaderCellComp extends Component {
    constructor(template, ctrl) {
        super(template);
        this.ctrl = ctrl;
    }
    getCtrl() {
        return this.ctrl;
    }
}
