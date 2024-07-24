import type { UserComponentFactory } from '../../../components/framework/userComponentFactory';
import { HorizontalDirection } from '../../../constants/direction';
import { BeanStub } from '../../../context/beanStub';
import type { BeanCollection } from '../../../context/context';
import type { CtrlsService } from '../../../ctrlsService';
import type { DragAndDropService, DragSource } from '../../../dragAndDrop/dragAndDropService';
import type { AgColumn } from '../../../entities/agColumn';
import { isColumn } from '../../../entities/agColumn';
import type { AgColumnGroup } from '../../../entities/agColumnGroup';
import type { AgProvidedColumnGroup } from '../../../entities/agProvidedColumnGroup';
import type { ColumnHeaderClickedEvent, ColumnHeaderContextMenuEvent, HeaderFocusedEvent } from '../../../events';
import type { FocusService } from '../../../focusService';
import type { PinnedWidthService } from '../../../gridBodyComp/pinnedWidthService';
import type { BrandedType } from '../../../interfaces/brandedType';
import type { ColumnPinnedType } from '../../../interfaces/iColumn';
import type { WithoutGridCommon } from '../../../interfaces/iCommon';
import type { MenuService } from '../../../misc/menuService';
import { _setAriaColIndex } from '../../../utils/aria';
import { _getInnerWidth } from '../../../utils/dom';
import { _isUserSuppressingHeaderKeyboardEvent } from '../../../utils/keyboard';
import { KeyCode } from '../.././../constants/keyCode';
import type { HeaderRowCtrl } from '../../row/headerRowCtrl';
import { refreshFirstAndLastStyles } from '../cssClassApplier';

let instanceIdSequence = 0;

export interface IAbstractHeaderCellComp {
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
}

export interface IHeaderResizeFeature {
    toggleColumnResizing(resizing: boolean): void;
}

export type HeaderCellCtrlInstanceId = BrandedType<string, 'HeaderCellCtrlInstanceId'>;

export abstract class AbstractHeaderCellCtrl<
    TComp extends IAbstractHeaderCellComp = any,
    TColumn extends AgColumn | AgColumnGroup = any,
    TFeature extends IHeaderResizeFeature = any,
> extends BeanStub {
    public static DOM_DATA_KEY_HEADER_CTRL = 'headerCtrl';

    private pinnedWidthService: PinnedWidthService;
    protected focusService: FocusService;
    protected userComponentFactory: UserComponentFactory;
    protected ctrlsService: CtrlsService;
    protected dragAndDropService: DragAndDropService;
    protected menuService: MenuService;

    public wireBeans(beans: BeanCollection) {
        this.pinnedWidthService = beans.pinnedWidthService;
        this.focusService = beans.focusService;
        this.userComponentFactory = beans.userComponentFactory;
        this.ctrlsService = beans.ctrlsService;
        this.dragAndDropService = beans.dragAndDropService;
        this.menuService = beans.menuService;
    }

    protected beans: BeanCollection;
    private instanceId: HeaderCellCtrlInstanceId;
    private columnGroupChild: AgColumn | AgColumnGroup;
    private parentRowCtrl: HeaderRowCtrl;

    private isResizing: boolean;
    private resizeToggleTimeout = 0;
    protected resizeMultiplier = 1;

    protected eGui: HTMLElement;
    protected resizeFeature: TFeature | null = null;
    protected comp: TComp;
    protected column: TColumn;

    public lastFocusEvent: KeyboardEvent | null = null;

    protected dragSource: DragSource | null = null;

    protected abstract resizeHeader(delta: number, shiftKey: boolean): void;
    protected abstract moveHeader(direction: HorizontalDirection): void;

    constructor(columnGroupChild: AgColumn | AgColumnGroup, beans: BeanCollection, parentRowCtrl: HeaderRowCtrl) {
        super();

        this.columnGroupChild = columnGroupChild;
        this.parentRowCtrl = parentRowCtrl;
        this.beans = beans;

        // unique id to this instance, including the column ID to help with debugging in React as it's used in 'key'
        this.instanceId = (columnGroupChild.getUniqueId() + '-' + instanceIdSequence++) as HeaderCellCtrlInstanceId;
    }

    public postConstruct(): void {
        this.addManagedPropertyListeners(['suppressHeaderFocus'], () => this.refreshTabIndex());
    }

    protected shouldStopEventPropagation(e: KeyboardEvent): boolean {
        const { headerRowIndex, column } = this.focusService.getFocusedHeader()!;

        return _isUserSuppressingHeaderKeyboardEvent(this.gos, e, headerRowIndex, column as AgColumn);
    }

    protected getWrapperHasFocus(): boolean {
        const activeEl = this.gos.getActiveDomElement();

        return activeEl === this.eGui;
    }

    protected setGui(eGui: HTMLElement): void {
        this.eGui = eGui;
        this.addDomData();
        this.addManagedListeners(this.beans.eventService, {
            displayedColumnsChanged: this.onDisplayedColumnsChanged.bind(this),
        });

        this.addManagedElementListeners(this.eGui, {
            focus: this.onGuiFocus.bind(this),
        });

        this.onDisplayedColumnsChanged();
        this.refreshTabIndex();
    }

    private onGuiFocus(): void {
        const event: WithoutGridCommon<HeaderFocusedEvent> = {
            type: 'headerFocused',
            column: this.column,
        };

        this.eventService.dispatchEvent(event);
    }

    protected onDisplayedColumnsChanged(): void {
        if (!this.comp || !this.column) {
            return;
        }
        this.refreshFirstAndLastStyles();
        this.refreshAriaColIndex();
    }

    private refreshFirstAndLastStyles(): void {
        const { comp, column, beans } = this;
        refreshFirstAndLastStyles(comp, column, beans.visibleColsService);
    }

    private refreshAriaColIndex(): void {
        const { beans, column } = this;

        const colIdx = beans.visibleColsService.getAriaColIndex(column);
        _setAriaColIndex(this.eGui, colIdx); // for react, we don't use JSX, as it slowed down column moving
    }

    protected addResizeAndMoveKeyboardListeners(): void {
        if (!this.resizeFeature) {
            return;
        }

        this.addManagedListeners(this.eGui, {
            keydown: this.onGuiKeyDown.bind(this),
            keyup: this.onGuiKeyUp.bind(this),
        });
    }

    private refreshTabIndex(): void {
        const suppressHeaderFocus = this.focusService.isHeaderFocusSuppressed();
        if (suppressHeaderFocus) {
            this.eGui.removeAttribute('tabindex');
        } else {
            this.eGui.setAttribute('tabindex', '-1');
        }
    }

    private onGuiKeyDown(e: KeyboardEvent): void {
        const activeEl = this.gos.getActiveDomElement();

        const isLeftOrRight = e.key === KeyCode.LEFT || e.key === KeyCode.RIGHT;

        if (this.isResizing) {
            e.preventDefault();
            e.stopImmediatePropagation();
        }

        if (
            // if elements within the header are focused, we don't process the event
            activeEl !== this.eGui ||
            // if shiftKey and altKey are not pressed, it's cell navigation so we don't process the event
            (!e.shiftKey && !e.altKey)
        ) {
            return;
        }

        if (this.isResizing || isLeftOrRight) {
            e.preventDefault();
            e.stopImmediatePropagation();
        }

        if (!isLeftOrRight) {
            return;
        }

        const isLeft = (e.key === KeyCode.LEFT) !== this.gos.get('enableRtl');
        const direction = HorizontalDirection[isLeft ? 'Left' : 'Right'];

        if (e.altKey) {
            this.isResizing = true;
            this.resizeMultiplier += 1;
            const diff = this.getViewportAdjustedResizeDiff(e);
            this.resizeHeader(diff, e.shiftKey);
            this.resizeFeature?.toggleColumnResizing(true);
        } else {
            this.moveHeader(direction);
        }
    }

    private getViewportAdjustedResizeDiff(e: KeyboardEvent): number {
        let diff = this.getResizeDiff(e);

        const pinned = this.column.getPinned();
        if (pinned) {
            const leftWidth = this.pinnedWidthService.getPinnedLeftWidth();
            const rightWidth = this.pinnedWidthService.getPinnedRightWidth();
            const bodyWidth = _getInnerWidth(this.ctrlsService.getGridBodyCtrl().getBodyViewportElement()) - 50;

            if (leftWidth + rightWidth + diff > bodyWidth) {
                if (bodyWidth > leftWidth + rightWidth) {
                    // allow body width to ignore resize multiplier and fill space for last tick
                    diff = bodyWidth - leftWidth - rightWidth;
                } else {
                    return 0;
                }
            }
        }

        return diff;
    }

    private getResizeDiff(e: KeyboardEvent): number {
        let isLeft = (e.key === KeyCode.LEFT) !== this.gos.get('enableRtl');

        const pinned = this.column.getPinned();
        const isRtl = this.gos.get('enableRtl');
        if (pinned) {
            if (isRtl !== (pinned === 'right')) {
                isLeft = !isLeft;
            }
        }

        return (isLeft ? -1 : 1) * this.resizeMultiplier;
    }

    private onGuiKeyUp(): void {
        if (!this.isResizing) {
            return;
        }
        if (this.resizeToggleTimeout) {
            window.clearTimeout(this.resizeToggleTimeout);
            this.resizeToggleTimeout = 0;
        }

        this.isResizing = false;
        this.resizeMultiplier = 1;

        this.resizeToggleTimeout = window.setTimeout(() => {
            this.resizeFeature?.toggleColumnResizing(false);
        }, 150);
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
        this.gos.setDomData(this.eGui, key, this);
        this.addDestroyFunc(() => this.gos.setDomData(this.eGui, key, null));
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public focus(event?: KeyboardEvent): boolean {
        if (!this.eGui) {
            return false;
        }

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

    public getInstanceId(): HeaderCellCtrlInstanceId {
        return this.instanceId;
    }

    public getColumnGroupChild(): AgColumn | AgColumnGroup {
        return this.columnGroupChild;
    }

    protected removeDragSource(): void {
        if (this.dragSource) {
            this.dragAndDropService.removeDragSource(this.dragSource);
            this.dragSource = null;
        }
    }

    protected handleContextMenuMouseEvent(
        mouseEvent: MouseEvent | undefined,
        touchEvent: TouchEvent | undefined,
        column: AgColumn | AgProvidedColumnGroup
    ): void {
        const event = mouseEvent ?? touchEvent!;
        if (this.gos.get('preventDefaultOnContextMenu')) {
            event.preventDefault();
        }
        const columnToUse = isColumn(column) ? column : undefined;
        if (this.menuService.isHeaderContextMenuEnabled(columnToUse)) {
            this.menuService.showHeaderContextMenu(columnToUse, mouseEvent, touchEvent);
        }

        this.dispatchColumnMouseEvent('columnHeaderContextMenu', column);
    }

    protected dispatchColumnMouseEvent(
        eventType: 'columnHeaderContextMenu' | 'columnHeaderClicked',
        column: AgColumn | AgProvidedColumnGroup
    ): void {
        const event: WithoutGridCommon<ColumnHeaderClickedEvent | ColumnHeaderContextMenuEvent> = {
            type: eventType,
            column,
        };

        this.eventService.dispatchEvent(event);
    }

    public override destroy(): void {
        super.destroy();

        this.removeDragSource();
        (this.comp as any) = null;
        (this.column as any) = null;
        (this.resizeFeature as any) = null;
        (this.lastFocusEvent as any) = null;
        (this.columnGroupChild as any) = null;
        (this.parentRowCtrl as any) = null;
        (this.eGui as any) = null;
    }
}
