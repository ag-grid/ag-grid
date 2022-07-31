import { BeanStub } from "../../../context/beanStub";
import { IHeaderColumn } from "../../../entities/iHeaderColumn";
import { FocusService } from "../../../focusService";
import { HeaderRowCtrl } from "../../row/headerRowCtrl";
import { Beans } from "../../../rendering/beans";
import { UserComponentFactory } from '../../../components/framework/userComponentFactory';
import { ColumnPinnedType } from "../../../entities/column";
export interface IAbstractHeaderCellComp {
}
export declare class AbstractHeaderCellCtrl extends BeanStub {
    static DOM_DATA_KEY_HEADER_CTRL: string;
    protected readonly focusService: FocusService;
    protected readonly beans: Beans;
    protected readonly userComponentFactory: UserComponentFactory;
    private instanceId;
    private columnGroupChild;
    private parentRowCtrl;
    protected eGui: HTMLElement;
    lastFocusEvent: KeyboardEvent | null;
    constructor(columnGroupChild: IHeaderColumn, parentRowCtrl: HeaderRowCtrl);
    protected shouldStopEventPropagation(e: KeyboardEvent): boolean;
    protected getWrapperHasFocus(): boolean;
    protected setGui(eGui: HTMLElement): void;
    protected handleKeyDown(e: KeyboardEvent): void;
    private addDomData;
    getGui(): HTMLElement;
    focus(event?: KeyboardEvent): boolean;
    getRowIndex(): number;
    getParentRowCtrl(): HeaderRowCtrl;
    getPinned(): ColumnPinnedType;
    getInstanceId(): string;
    getColumnGroupChild(): IHeaderColumn;
}
