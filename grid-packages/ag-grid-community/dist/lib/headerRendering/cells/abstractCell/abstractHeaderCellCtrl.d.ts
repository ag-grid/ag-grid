import { BeanStub } from "../../../context/beanStub";
import { IHeaderColumn } from "../../../interfaces/iHeaderColumn";
import { FocusService } from "../../../focusService";
import { HeaderRowCtrl } from "../../row/headerRowCtrl";
import { Beans } from "../../../rendering/beans";
import { UserComponentFactory } from '../../../components/framework/userComponentFactory';
import { ColumnPinnedType } from "../../../entities/column";
import { CtrlsService } from "../../../ctrlsService";
import { HorizontalDirection } from "../../../constants/direction";
import { DragAndDropService, DragSource } from "../../../dragAndDrop/dragAndDropService";
export interface IAbstractHeaderCellComp {
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
}
export interface IHeaderResizeFeature {
    toggleColumnResizing(resizing: boolean): void;
}
export declare abstract class AbstractHeaderCellCtrl<TComp extends IAbstractHeaderCellComp = any, TColumn extends IHeaderColumn = any, TFeature extends IHeaderResizeFeature = any> extends BeanStub {
    static DOM_DATA_KEY_HEADER_CTRL: string;
    protected readonly focusService: FocusService;
    protected readonly beans: Beans;
    protected readonly userComponentFactory: UserComponentFactory;
    protected readonly ctrlsService: CtrlsService;
    protected readonly dragAndDropService: DragAndDropService;
    private instanceId;
    private columnGroupChild;
    private parentRowCtrl;
    private isResizing;
    private resizeToggleTimeout;
    protected resizeMultiplier: number;
    protected eGui: HTMLElement;
    protected resizeFeature: TFeature | null;
    protected comp: TComp;
    protected column: TColumn;
    lastFocusEvent: KeyboardEvent | null;
    protected dragSource: DragSource | null;
    protected abstract resizeHeader(direction: HorizontalDirection, shiftKey: boolean): void;
    protected abstract moveHeader(direction: HorizontalDirection): void;
    constructor(columnGroupChild: IHeaderColumn, parentRowCtrl: HeaderRowCtrl);
    protected shouldStopEventPropagation(e: KeyboardEvent): boolean;
    protected getWrapperHasFocus(): boolean;
    protected setGui(eGui: HTMLElement): void;
    protected onDisplayedColumnsChanged(): void;
    private refreshFirstAndLastStyles;
    private refreshAriaColIndex;
    protected addResizeAndMoveKeyboardListeners(): void;
    private onGuiKeyDown;
    private onGuiKeyUp;
    protected handleKeyDown(e: KeyboardEvent): void;
    private addDomData;
    getGui(): HTMLElement;
    focus(event?: KeyboardEvent): boolean;
    getRowIndex(): number;
    getParentRowCtrl(): HeaderRowCtrl;
    getPinned(): ColumnPinnedType;
    getInstanceId(): string;
    getColumnGroupChild(): IHeaderColumn;
    protected removeDragSource(): void;
    protected destroy(): void;
}
