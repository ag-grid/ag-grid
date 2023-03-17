/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { Component } from "./component";
export class PopupComponent extends Component {
    isPopup() {
        return true;
    }
    setParentComponent(container) {
        container.addCssClass('ag-has-popup');
        super.setParentComponent(container);
    }
    destroy() {
        const parentComp = this.parentComponent;
        const hasParent = parentComp && parentComp.isAlive();
        if (hasParent) {
            parentComp.getGui().classList.remove('ag-has-popup');
        }
        super.destroy();
    }
}
