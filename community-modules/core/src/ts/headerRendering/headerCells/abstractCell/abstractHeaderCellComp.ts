import { ColumnGroup } from "../../../entities/columnGroup";
import { Column } from "../../../entities/column";
import { isUserSuppressingHeaderKeyboardEvent } from "../../../utils/keyboard";
import { Component } from "../../../widgets/component";
import { Autowired } from "../../../context/context";
import { FocusService } from "../../../focusService";

export abstract class AbstractHeaderCellComp extends Component {

    @Autowired('focusService') protected focusService: FocusService;

    protected abstract readonly column: Column | ColumnGroup;
    protected abstract readonly pinned: string | null;

    protected abstract onFocusIn(e: FocusEvent): void;

    protected shouldStopEventPropagation(e: KeyboardEvent): boolean {
        const { headerRowIndex, column } = this.focusService.getFocusedHeader()!;

        return isUserSuppressingHeaderKeyboardEvent(
            this.gridOptionsWrapper,
            e,
            headerRowIndex,
            column
        );
    }

    public getColumn(): Column | ColumnGroup {
        return this.column;
    }

    public getPinned(): string | null {
        return this.pinned;
    }
}