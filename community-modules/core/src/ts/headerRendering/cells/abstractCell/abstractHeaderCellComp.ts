import { ColumnGroup } from "../../../entities/columnGroup";
import { Column } from "../../../entities/column";
import { isUserSuppressingHeaderKeyboardEvent } from "../../../utils/keyboard";
import { Component } from "../../../widgets/component";
import { Autowired } from "../../../context/context";
import { FocusService } from "../../../focusService";
import { AbstractHeaderCellCtrl } from "./abstractHeaderCellCtrl";

export abstract class AbstractHeaderCellComp<T extends AbstractHeaderCellCtrl> extends Component {

    @Autowired('focusService') protected focusService: FocusService;

    protected ctrl: T;

    constructor(template: string, ctrl: T) {
        super(template);
        this.ctrl = ctrl;
    }

    /// temp - this is in the AbstractHeaderCellCtrl also, once all comps refactored, this can be removed
    protected shouldStopEventPropagation(e: KeyboardEvent): boolean {
        const { headerRowIndex, column } = this.focusService.getFocusedHeader()!;

        return isUserSuppressingHeaderKeyboardEvent(
            this.gridOptionsWrapper,
            e,
            headerRowIndex,
            column
        );
    }

    public getCtrl(): T {
        return this.ctrl;
    }
}