import type { IPopupComponent } from '../interfaces/iPopupComponent';
import { Component } from './component';

export class PopupComponent extends Component implements IPopupComponent<any> {
    public isPopup(): boolean {
        return true;
    }

    override setParentComponent(container: Component) {
        container.addCss('ag-has-popup');
        super.setParentComponent(container);
    }

    public override destroy(): void {
        const parentComp = this.parentComponent;
        const hasParent = parentComp && parentComp.isAlive();

        if (hasParent) {
            parentComp!.getGui().classList.remove('ag-has-popup');
        }

        super.destroy();
    }
}
