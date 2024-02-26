import { Component } from "./component";
import { IPopupComponent } from "../interfaces/iPopupComponent";

export class PopupComponent extends Component implements IPopupComponent<any> {

    public isPopup(): boolean {
        return true;
    }

    setParentComponent(container: Component) {
        container.addCssClass('ag-has-popup');
        super.setParentComponent(container);
    }

    public destroy(): void {
        const parentComp = this.parentComponent;
        const hasParent = parentComp && parentComp.isAlive();

        if (hasParent) {
            parentComp!.getGui().classList.remove('ag-has-popup');
        }

        super.destroy();
    }
}
