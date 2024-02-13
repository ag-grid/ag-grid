import { Component } from "../../../widgets/component";
import { AbstractHeaderCellCtrl } from "./abstractHeaderCellCtrl";

export abstract class AbstractHeaderCellComp<T extends AbstractHeaderCellCtrl> extends Component {

    protected ctrl: T;

    constructor(template: string, ctrl: T) {
        super(template);
        this.ctrl = ctrl;

        const tabIndex = ctrl.getTabIndex();
        if (tabIndex !== undefined) {
            this.getGui().setAttribute('tabindex', tabIndex.toString());
        }
    }

    public getCtrl(): T {
        return this.ctrl;
    }
}