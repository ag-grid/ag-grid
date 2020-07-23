import { Component } from "./component";
import { IPopupComponent } from "../interfaces/iPopupComponent";
import { addCssClass, removeCssClass } from "../utils/dom";

export class PopupComponent extends Component implements IPopupComponent<any> {

    public isPopup(): boolean {
        return true;
    }

    setParentComponent(container: Component) {
        addCssClass(container.getGui(), 'ag-has-popup');
        super.setParentComponent(container);
    }

    public destroy(): void {
        const parentComp = this.parentComponent;
        const hasParent = parentComp && parentComp.isAlive();

        if (hasParent) {
            removeCssClass(parentComp.getGui(), 'ag-has-popup');
        }

        super.destroy();
    }
}
