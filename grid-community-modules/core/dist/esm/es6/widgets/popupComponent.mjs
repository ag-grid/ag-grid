import { Component } from "./component.mjs";
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
