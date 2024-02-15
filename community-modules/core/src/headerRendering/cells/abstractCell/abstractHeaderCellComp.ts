import { Component } from "../../../widgets/component";
import { AbstractHeaderCellCtrl } from "./abstractHeaderCellCtrl";

export abstract class AbstractHeaderCellComp<T extends AbstractHeaderCellCtrl> extends Component {

    protected ctrl: T;

    constructor(template: string, ctrl: T) {
        super(template);
        this.ctrl = ctrl;
    }

    public getCtrl(): T {
        return this.ctrl;
    }
}