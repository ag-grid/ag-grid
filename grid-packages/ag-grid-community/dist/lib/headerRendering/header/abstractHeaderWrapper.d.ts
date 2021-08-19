import { ColumnGroup } from "../../entities/columnGroup";
import { Column } from "../../entities/column";
import { Component } from "../../widgets/component";
import { FocusService } from "../../focusService";
export declare abstract class AbstractHeaderWrapper extends Component {
    protected focusService: FocusService;
    protected abstract readonly column: Column | ColumnGroup;
    protected abstract readonly pinned: string | null;
    protected abstract onFocusIn(e: FocusEvent): void;
    protected shouldStopEventPropagation(e: KeyboardEvent): boolean;
    getColumn(): Column | ColumnGroup;
    getPinned(): string | null;
}
