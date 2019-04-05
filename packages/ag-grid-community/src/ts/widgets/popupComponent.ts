import { Component } from "./component";
import { IPopupComponent } from "../interfaces/iPopupComponent";
import { _ } from "../utils";

export class PopupComponent extends Component implements IPopupComponent<any> {
    public isPopup(): boolean {
        return true;
    }

    setParentComponent(container: Component) {
        _.addCssClass(container.getGui(), 'ag-has-popup');
        super.setParentComponent(container);
    }

    destroy() {
        const parentComp = this.parentComponent;
        const hasParent = parentComp && parentComp.isAlive();

        if (hasParent) {
            _.removeCssClass(parentComp.getGui(), 'ag-has-popup');
        }

        super.destroy();
    }
}