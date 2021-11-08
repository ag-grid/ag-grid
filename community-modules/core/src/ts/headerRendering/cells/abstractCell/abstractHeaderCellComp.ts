import { ColumnGroup } from "../../../entities/columnGroup";
import { Column } from "../../../entities/column";
import { isUserSuppressingHeaderKeyboardEvent } from "../../../utils/keyboard";
import { Component } from "../../../widgets/component";
import { Autowired } from "../../../context/context";
import { FocusService } from "../../../focusService";
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