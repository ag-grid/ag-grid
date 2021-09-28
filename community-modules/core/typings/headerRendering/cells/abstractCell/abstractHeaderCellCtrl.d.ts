import { BeanStub } from "../../../context/beanStub";
import { IHeaderColumn } from "../../../entities/iHeaderColumn";
import { FocusService } from "../../../focusService";
import { HeaderRowCtrl } from "../../row/headerRowCtrl";
export interface IAbstractHeaderCellComp {
}
export declare class AbstractHeaderCellCtrl extends BeanStub {
    static DOM_DATA_KEY_HEADER_CTRL: string;
    protected focusService: FocusService;
    private instanceId;
    private columnGroupChild;
    private parentRowCtrl;
    protected eGui: HTMLElement;
    constructor(columnGroupChild: IHeaderColumn, parentRowCtrl: HeaderRowCtrl);
    protected shouldStopEventPropagation(e: KeyboardEvent): boolean;
    protected setGui(eGui: HTMLElement): void;
    private addDomData;
    focus(): boolean;
    getRowIndex(): number;
    getParentRowCtrl(): HeaderRowCtrl;
    getPinned(): string | null;
    getInstanceId(): string;
    getColumnGroupChild(): IHeaderColumn;
}
