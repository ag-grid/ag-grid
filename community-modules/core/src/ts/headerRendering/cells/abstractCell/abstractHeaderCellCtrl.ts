import { BeanStub } from "../../../context/beanStub";
import { Autowired } from "../../../context/context";
import { IHeaderColumn } from "../../../entities/iHeaderColumn";
import { FocusService } from "../../../focusService";
import { isUserSuppressingHeaderKeyboardEvent } from "../../../utils/keyboard";
import { HeaderRowCtrl } from "../../row/headerRowCtrl";
import { IHeaderCellComp } from "../column/headerCellCtrl";

let instanceIdSequence = 0;

export interface IAbstractHeaderCellComp {
}

export class AbstractHeaderCellCtrl extends BeanStub {

    public static DOM_DATA_KEY_HEADER_CTRL = 'headerCtrl';

    @Autowired('focusService') protected focusService: FocusService;

    private instanceId: string;

    private columnGroupChild: IHeaderColumn;

    private parentRowCtrl: HeaderRowCtrl;

    protected eGui: HTMLElement;

    public lastFocusEvent: KeyboardEvent | null = null;

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

    protected setGui(eGui: HTMLElement): void {
        this.eGui = eGui;
        this.addDomData();
    }

    private addDomData(): void {
        const key = AbstractHeaderCellCtrl.DOM_DATA_KEY_HEADER_CTRL;
        this.gridOptionsWrapper.setDomData(this.eGui, key, this);
        this.addDestroyFunc(() => this.gridOptionsWrapper.setDomData(this.eGui, key, null));
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public focus(event?: KeyboardEvent): boolean {
        if (!this.eGui) { return false; }

        this.lastFocusEvent = event || null;
        this.eGui.focus();
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
