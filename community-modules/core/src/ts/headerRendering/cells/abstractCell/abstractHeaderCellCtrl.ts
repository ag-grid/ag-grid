import { BeanStub } from "../../../context/beanStub";
import { Autowired } from "../../../context/context";
import { IHeaderColumn } from "../../../entities/iHeaderColumn";
import { FocusService } from "../../../focusService";
import { isUserSuppressingHeaderKeyboardEvent } from "../../../utils/keyboard";
import { HeaderRowCtrl } from "../../row/headerRowCtrl";
import { IHeaderCellComp } from "../column/headerCellCtrl";

let instanceIdSequence = 0;

export interface IAbstractHeaderCellComp {
    focus(): void;
}

export class AbstractHeaderCellCtrl extends BeanStub {

    @Autowired('focusService') protected focusService: FocusService;

    private instanceId: string;

    private columnGroupChild: IHeaderColumn;

    private parentRowCtrl: HeaderRowCtrl;

    private abstractComp: IAbstractHeaderCellComp;

    constructor(columnGroupChild: IHeaderColumn, parentRowCtrl: HeaderRowCtrl) {
        super();

        this.columnGroupChild = columnGroupChild;
        this.parentRowCtrl = parentRowCtrl;

        // unique id to this instance, including the column ID to help with debugging in React as it's used in 'key'
        this.instanceId = columnGroupChild.getUniqueId() + '-' + instanceIdSequence++;
    }

    protected shouldStopEventPropagation(e: KeyboardEvent): boolean {
        const { headerRowIndex, column } = this.focusService.getFocusedHeader()!;

        return isUserSuppressingHeaderKeyboardEvent(
            this.gridOptionsWrapper,
            e,
            headerRowIndex,
            column
        );
    }

    protected setAbstractComp(abstractComp: IAbstractHeaderCellComp): void {
        this.abstractComp = abstractComp;
    }

    public focus(): boolean {
        if (!this.abstractComp) { return false; }

        this.abstractComp.focus();
        return true;
    }

    public getRowIndex(): number {
        return this.parentRowCtrl.getRowIndex();
    }

    public getParentRowCtrl(): HeaderRowCtrl {
        return this.parentRowCtrl;
    }

    public getPinned(): string | null {
        return this.parentRowCtrl.getPinned();
    }

    public getInstanceId(): string {
        return this.instanceId;
    }

    public getColumnGroupChild(): IHeaderColumn {
        return this.columnGroupChild;
    }
}
