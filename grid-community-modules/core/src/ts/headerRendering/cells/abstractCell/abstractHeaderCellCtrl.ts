import { BeanStub } from "../../../context/beanStub";
import { Autowired } from "../../../context/context";
import { IHeaderColumn } from "../../../interfaces/iHeaderColumn";
import { FocusService } from "../../../focusService";
import { isUserSuppressingHeaderKeyboardEvent } from "../../../utils/keyboard";
import { HeaderRowCtrl } from "../../row/headerRowCtrl";
import { KeyCode } from "../.././../constants/keyCode";
import { Beans } from "../../../rendering/beans";
import { UserComponentFactory } from '../../../components/framework/userComponentFactory';
import { ColumnPinnedType } from "../../../entities/column";
import { CtrlsService } from "../../../ctrlsService";
import { HorizontalDirection } from "../../../constants/direction";

let instanceIdSequence = 0;

export interface IAbstractHeaderCellComp {
}

export abstract class AbstractHeaderCellCtrl extends BeanStub {

    public static DOM_DATA_KEY_HEADER_CTRL = 'headerCtrl';

    @Autowired('focusService') protected readonly focusService: FocusService;
    @Autowired('beans') protected readonly beans: Beans;
    @Autowired('userComponentFactory') protected readonly userComponentFactory: UserComponentFactory;
    @Autowired('ctrlsService') protected readonly ctrlsService: CtrlsService;

    private instanceId: string;

    private columnGroupChild: IHeaderColumn;

    private parentRowCtrl: HeaderRowCtrl;

    protected eGui: HTMLElement;

    public lastFocusEvent: KeyboardEvent | null = null;

    protected abstract resizeHeader(direction: HorizontalDirection, shiftKey: boolean): void;
    protected abstract moveHeader(direction: HorizontalDirection): void;

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
            this.gridOptionsService,
            e,
            headerRowIndex,
            column
        );
    }

    protected getWrapperHasFocus(): boolean {
        const eDocument = this.gridOptionsService.getDocument();
        const activeEl = eDocument.activeElement;

        return activeEl === this.eGui;
    }

    protected setGui(eGui: HTMLElement, skipKeyDownListener?: boolean): void {
        this.eGui = eGui;
        this.addDomData();

        if (!skipKeyDownListener) {
            this.addManagedListener(eGui, 'keydown', this.onGuiKeyDown.bind(this));
        }
    }

    private onGuiKeyDown(e: KeyboardEvent): void {
        const eDocument = this.gridOptionsService.getDocument();
        const activeEl = eDocument.activeElement;

        if (
            // if elements within the header are focused, we don't process the event
            activeEl !== this.eGui ||
            // if shiftKey and altKey are not pressed, it's cell navigation so we don't process the event
            (!e.shiftKey && !e.altKey) ||
            // only process LEFT and RIGHT
            (e.key !== KeyCode.LEFT && e.key !== KeyCode.RIGHT)
        ) { return; }

        e.preventDefault();
        e.stopImmediatePropagation();
        
        const direction = HorizontalDirection[e.key === KeyCode.LEFT ? 'Left' : 'Right' ];
        if (e.altKey) {
            this.resizeHeader(direction, e.shiftKey);
        } else {
            this.moveHeader(direction);
        }
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        const wrapperHasFocus = this.getWrapperHasFocus();

        switch (e.key) {
            case KeyCode.PAGE_DOWN:
            case KeyCode.PAGE_UP:
            case KeyCode.PAGE_HOME:
            case KeyCode.PAGE_END:
                if (wrapperHasFocus) {
                    e.preventDefault();
                }
        }
    }

    private addDomData(): void {
        const key = AbstractHeaderCellCtrl.DOM_DATA_KEY_HEADER_CTRL;
        this.gridOptionsService.setDomData(this.eGui, key, this);
        this.addDestroyFunc(() => this.gridOptionsService.setDomData(this.eGui, key, null));
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

    public getPinned(): ColumnPinnedType {
        return this.parentRowCtrl.getPinned();
    }

    public getInstanceId(): string {
        return this.instanceId;
    }

    public getColumnGroupChild(): IHeaderColumn {
        return this.columnGroupChild;
    }
}
